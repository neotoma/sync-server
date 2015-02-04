var EventEmitter = require('events').EventEmitter;
var logger = require('../../lib/logger');
var https = require('https');
var UserSourceAuth = require('../../models/user-source-auth');
var UserStorageAuth = require('../../models/user-storage-auth');
var Item = require('../../models/item');
var Status = require('../../models/status');
var apiVersion = '20140404';
var foursquare = {};

var sourceItemDescription = function(content_type_id, item) {
  switch(content_type_id) {
    case 'friend':
      var name = item.firstName;

      if (item.lastName) {
        name = name + ' ' + item.lastName;
      }

      return name;
      break;
    case 'checkin':
      return item.venue.name;
      break;
    case 'tip':
      return item.venue.name;
      break;
    default:
      return;
  }
};

foursquare.toObject = function(userSourceAuths) {
  return {
    id: 'foursquare',
    name: 'foursquare',
    enabled: true,
    logoGlyphPath: '/images/logos/foursquare-glyph.svg',
    contentTypes: ['checkin','tip','friend'],
    userSourceAuths: this.userSourceAuthIds(userSourceAuths, 'foursquare')
  };
};

foursquare.syncAll = function(app, user) {
  try {
    UserStorageAuth.findOne({
      user_id: user.id,
    }, function(error, userStorageAuth) {
      if (error) {
        return logger.error('failed to find user storage auth for user', { error: error });
      }

      var storage = require('../../controllers/storages/' + userStorageAuth.storage_id);

      foursquare.syncItems(app, user, storage, 'checkins');
      foursquare.syncItems(app, user, storage, 'friends');
      foursquare.syncItems(app, user, storage, 'tips');
    });
  } catch (error) {
    logger.error('failed to sync all foursquare content types', {
      error: error
    });
  }
};

foursquare.syncItems = function(app, user, storage, aspect) {
  try {
    logger.trace('starting foursquare items sync', { 
      user_id: user.id, 
      aspect: aspect 
    });

    var content_type_id = aspect.substring(0, aspect.length - 1);

    Status.findOrCreate({
      user_id: user.id,
      storage_id: 'dropbox',
      source_id: 'foursquare',
      content_type_id: content_type_id
    }, function(error, status) {
      if (!status) {
        logger.error('failed to find or create status', { 
          error: error
        });
      } else {
        var offset = 0;

        var syncNextPage = function() {
          logger.trace('syncing foursquare next page of items', { 
            user_id: user.id, 
            aspect: aspect,
            offset: offset
          });

          UserSourceAuth.findOne({
            user_id: user.id,
            source_id: "foursquare"
          }, function(error, userSourceAuth) {
            if (!userSourceAuth) {
              logger.error('failed to find user source auth', { 
                error: error
              });
            } else {
              var options = {
                host: 'api.foursquare.com',
                path: '/v2/users/self/' + aspect + '?v=' + apiVersion + '&oauth_token=' + userSourceAuth.source_token + '&limit=250&offset=' + offset,
              };

              https.get(options, function(res) {
                if (res.statusCode == 401) {
                  throw new Error('unauthorized request');
                }

                var data = '';

                res.on('data', function(chunk) {
                  data += chunk;
                });

                res.on('end', function() {
                  try {
                    var json = JSON.parse(data);
                    
                    if (typeof json.meta.errorType != 'undefined') {
                      throw new Error(json.meta.errorType + ' - ' + json.meta.errorDetail);
                    }

                    var items = json.response[aspect].items;
                    
                    logger.trace('retrieved foursquare next page of items', { 
                      user_id: user.id, 
                      aspect: aspect,
                      offset: offset,
                      total: items.length
                    });

                    if (offset == 0) {
                      status.total_items_available = json.response[aspect].count;
                      status.save();
                    }

                    if (items.length != 0) {
                      while (items.length > 0) {
                        foursquare.syncItem(app, user, storage, aspect, items.shift());
                        offset++;
                      }

                      syncNextPage();
                    } else {
                      logger.trace('finished starting foursquare items sync', { 
                        user_id: user.id, 
                        aspect: aspect
                      });
                    }
                  } catch(error) {
                    logger.error('failed to parse foursquare items data', {
                      error: error,
                      options: options,
                      data: data
                    });
                  }
                });
              }).on('error', function(error) {
                logger.error('failed to retrieve next page of foursquare items', {
                  error: error
                });
              });
            }
          });
        };

        syncNextPage();
      }
    });
  } catch (error) {
    logger.error('failed to sync foursquare items', {
      error: error
    });
  }    
}

foursquare.syncItem = function(app, user, storage, aspect, sourceItem) {
  logger.trace('syncing foursquare item', {
    user_id: user.id,
    aspect: aspect,
    source_item_id: sourceItem.id
  });

  var content_type_id = aspect.substring(0, aspect.length - 1);

  Item.findOrCreate({
    user_id: user.id,
    storage_id: 'dropbox',
    source_id: 'foursquare',
    source_item_id: sourceItem.id,
    content_type_id: content_type_id,
    description: sourceItemDescription(content_type_id, sourceItem)
  }, function(error, item) {
    if (error) {
      logger.error('failed to find or create item', { 
        error: error
      });
    } else {
      if (item.sync_verified_at) {
        logger.trace('item already synced', {
          item_id: item.id
        });

        return;
      }

      item.sync_attempted_at = Date.now();
      item.save(function(error) {
        if (error) {
          logger.error('failed to update item with sync_attempted_at', {
            error: error
          });
        }
      });

      storage.saveFile(
        user, 
        '/sources/foursquare/' + aspect + '/' + sourceItem.id + '.json',
        JSON.stringify(sourceItem),
        function(response) {
          logger.trace('synced foursquare item', { 
            user_id: user.id, 
            aspect: aspect,
            source_item_id: sourceItem.id,
            response: response
          });

          item.sync_verified_at = Date.now();
          item.bytes = response.bytes;
          item.path = response.path;
          item.save(function(error) {
            if (error) {
              logger.error('failed to update item after syncing', { 
                error: error
              });
            } else {
              app.emit('itemSyncVerified', item);

              logger.trace('updated item', { 
                id: item.id 
              });
            }
          });
        },
        function(error) {
          logger.error('syncing foursquare item failed', { 
            user_id: user.id, 
            aspect: aspect,
            source_item_id: sourceItem.id,
            message: error.message
          });

          item.sync_failed_at = Date.now();
          item.error = error.message;
          item.save(function(error) {
            if (error) {
              logger.error('failed to update item after failure to sync', { 
                error: error 
              });
            }
          });
        }
      );
    }
  });
}

foursquare.userSourceAuthIds = function(userSourceAuths, sourceId) {
  return userSourceAuths.map(function(userSourceAuth) {
    if (userSourceAuth.source == sourceId) {
      return userSourceAuth.id;
    }
  })
}

module.exports = foursquare;