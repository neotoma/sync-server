var logger = require('../../lib/logger');
var https = require('https');
var UserSourceAuth = require('../../models/user-source-auth');
var Item = require('../../models/item');
var apiVersion = '20140404';
var foursquare = {};

foursquare.sync = function(user, storage) {
  foursquare.syncItems(user, storage, 'checkins');
  foursquare.syncItems(user, storage, 'tips');
  foursquare.syncItems(user, storage, 'friends');
};

foursquare.syncItems = function(user, storage, aspect) {
  try {
    logger.trace('starting foursquare items sync', { 
      user_id: user.id, 
      aspect: aspect 
    });

    var offset = 0;

    var syncNextPage = function() {
      logger.trace('syncing foursquare next page of items', { 
        user_id: user.id, 
        aspect: aspect,
        offset: offset
      });

      UserSourceAuth.findOne({
        user_id:    user.id,
        source_id: "foursquare"
      }, function(error, userSourceAuth) {
        if (!userSourceAuth) {
          logger.warn('failed to find user source auth', { 
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

                if (items.length != 0) {
                  while (items.length > 0) {
                    foursquare.syncItem(user, storage, aspect, items.shift());
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
                logger.warn('failed to parse foursquare items data', {
                  error: error
                });
              }
            });
          }).on('error', function(error) {
            logger.warn('failed to retrieve next page of foursquare items', {
              error: error
            });
          });
        }
      });
    };

    syncNextPage();
  } catch (error) {
    logger.warn('failed to sync foursquare items', {
      error: error
    });
  }    
}

foursquare.syncItem = function(user, storage, aspect, sourceItem) { 
  logger.trace('syncing foursquare item', { 
    user_id: user.id,
    aspect: aspect,
    source_item_id: sourceItem.id
  });

  Item.findOrCreate({
    user_id: user.id,
    storage_id: 'dropbox',
    source_id: 'foursquare',
    source_item_id: sourceItem.id,
    content_type_id: aspect.substring(0, aspect.length - 1)
  }, function(error, item) {
    if (error) {
      logger.warn('failed to find or create item', { 
        error: error 
      });
    } else {
      item.sync_attempted_at = Date.now();
      item.save(function(error) {
        if (error) {
          logger.warn('failed to update item with sync_attempted_at', { 
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
              logger.warn('failed to update item after syncing', { 
                error: error
              });
            } else {
              logger.trace('updated item', { 
                id: item.id 
              });
            }
          });
        },
        function(error) {
          logger.warn('syncing foursquare item failed', { 
            user_id: user.id, 
            aspect: aspect,
            source_item_id: sourceItem.id,
            message: error.message
          });

          item.sync_failed_at = Date.now();
          item.error = error.message;
          item.save(function(error) {
            if (error) {
              logger.warn('failed to update item after failure to sync', { 
                error: error 
              });
            }
          });
        }
      );
    }
  });
}

module.exports = foursquare;