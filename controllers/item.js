var logger = require('../lib/logger');
var Status = require('../models/status');
var Item = require('../models/item');
var UserSourceAuth = require('../models/user-source-auth');
var UserStorageAuth = require('../models/user-storage-auth');
var https = require('https');
var async = require('async');
var itemController = {};

itemController.syncAllForAllContentTypes = function(app, user, storage, source) {
  var self = this;

  try {
    logger.info('started to sync all items for all content types', {
      user_id: user.id,
      storage_id: storage.id,
      source_id: source.id
    });

    source.contentTypes.forEach(function(contentType) {
      self.syncAll(app, user, storage, source, contentType);
    });
  } catch (error) {
    logger.error('failed to sync all items for all content types', {
      user_id: user.id,
      storage_id: storage.id,
      source_id: source.id,
      error: error
    });
  }
};

itemController.syncAll = function(app, user, storage, source, contentType) {
  var self = this;

  logger.info('started to sync all items', {
    user_id: user.id,
    storage_id: storage.id,
    source_id: source.id,
    content_type_id: contentType.id
  });

  var syncPage = function myself(error, offset) {
    if (error) {
      logger.error('failed to sync page of items', {
        user_id: user.id,
        storage_id: storage.id,
        source_id: source.id,
        content_type_id: contentType.id,
        error: error
      });
    } else {
      self.syncPage(app, user, storage, source, contentType, offset, myself);
    }
  }

  syncPage(null, 0);    
}

itemController.syncPage = function(app, user, storage, source, contentType, offset, callback) {
  var self = this;

  try {
    logger.trace('started to sync page of items', { 
      user_id: user.id,
      storage_id: storage.id,
      source_id: source.id,
      content_type_id: contentType.id,
      offset: offset
    });

    Status.findOrCreate({
      user_id: user.id,
      storage_id: storage.id,
      source_id: source.id,
      content_type_id: contentType.id
    }, function(error, status) {
      if (error) {
        logger.error('failed to find or create status while syncing page of items', {
          user_id: user.id,
          storage_id: storage.id,
          source_id: source.id,
          content_type_id: contentType.id,
          offset: offset
        });

        return callback(error);
      }
         
      UserSourceAuth.findOne({
        user_id: user.id,
        source_id: source.id
      }, function(error, userSourceAuth) {
        if (error || !userSourceAuth) {
          logger.error('failed to find userSourceAuth while syncing page of items', {
            user_id: user.id,
            storage_id: storage.id,
            source_id: source.id,
            content_type_id: contentType.id,
            offset: offset,
            error: error
          });

          if (!error) {
            error = new Error('failed to find userSourceAuth while syncing page of items');
          }

          return callback(error);
        }

        var options = {
          host: source.host,
          path: source.itemsPagePath(contentType, userSourceAuth, offset),
        };

        https.get(options, function(res) {
          if (res.statusCode != 200) {
            var error = new Error('failed to retrieve page of items to sync');

            logger.error(error.message, {
              user_id: user.id,
              storage_id: storage.id,
              source_id: source.id,
              content_type_id: contentType.id,
              offset: offset,
              statusCode: res.statusCode
            });

            return callback(error);
          }

          var data = '';

          res.on('data', function(chunk) {
            data += chunk;
          });

          res.on('end', function() {
            try {
              var dataJSON = JSON.parse(data);
              
              if (typeof dataJSON.meta.errorType != 'undefined') {
                var error = new Error('failed to retrieve valid page of items to sync');
                
                logger.error(error.message, {
                  user_id: user.id,
                  storage_id: storage.id,
                  source_id: source.id,
                  content_type_id: contentType.id,
                  offset: offset,
                  errorType: dataJSON.meta.errorType,
                  errorDetail: dataJSON.meta.errorDetail,
                  errorType: dataJSON.meta.errorType
                });

                return callback(error);
              }

              var itemsJSON = dataJSON.response[contentType.plural_id].items;
              
              logger.trace('parsed page of items to sync', {
                user_id: user.id,
                storage_id: storage.id,
                source_id: source.id,
                content_type_id: contentType.id,
                offset: offset,
                total: itemsJSON.length
              });

              if (offset == 0) {
                status.total_items_available = dataJSON.response[contentType.plural_id].count;
                status.save();
              }

              if (itemsJSON.length != 0) {
                var syncItem = function(itemJSON, callback) {
                  try {
                    self.syncItem(app, user, storage, source, contentType, itemJSON, callback);
                  } catch (error) {
                    callback(error);
                  }
                }

                async.each(itemsJSON, syncItem, function(error) {
                  offset = offset + itemsJSON.length;
                  callback(null, offset);
                });
              } else {
                logger.trace('found no items to sync in page', { 
                  user_id: user.id,
                  storage_id: storage.id,
                  source_id: source.id,
                  content_type_id: contentType.id,
                  offset: offset
                });
              }
            } catch(error) {
              logger.error('failed to sync page of items', {
                error: error,
                user_id: user.id,
                storage_id: storage.id,
                source_id: source.id,
                content_type_id: contentType.id,
                offset: offset
              });
            }
          });
        }).on('error', function(error) {
          logger.error('failed to retrieve page of items to sync', {
            user_id: user.id,
            storage_id: storage.id,
            source_id: source.id,
            content_type_id: contentType.id,
            offset: offset,
            error: error
          });
        });
      });
    });
  } catch (error) {
    logger.error('failed to sync page of items', {
      user_id: user.id,
      storage_id: storage.id,
      source_id: source.id,
      content_type_id: contentType.id,
      offset: offset,
      error: error
    });
  }
}

itemController.syncItem = function(app, user, storage, source, contentType, itemJSON, callback) {
  var self = this;

  logger.trace('started to sync item', {
    user_id: user.id,
    storage_id: storage.id,
    source_id: source.id,
    content_type_id: contentType.id,
    source_item_id: itemJSON.id
  });

  Item.findOrCreate({
    user_id: user.id,
    storage_id: storage.id,
    source_id: source.id,
    content_type_id: contentType.id,
    source_item_id: itemJSON.id
  }, function(error, item) {
    if (error) {
      logger.error('failed to find or create item while syncing', { 
        error: error
      });

      callback(error);
    } else {
      if (item.sync_verified_at) {
        logger.trace('skipped syncing item because it is already verified', {
          user_id: user.id,
          storage_id: storage.id,
          source_id: source.id,
          content_type_id: contentType.id,
          source_item_id: item.source_item_id,
          item_id: item.id
        });

        callback();
      } else {
        item.data = itemJSON;
        item.description = source.itemDescription(contentType.id, itemJSON);
        item.sync_attempted_at = Date.now();
        item.save(function(error) {
          if (error) {
            logger.error('failed to save item while syncing', {
              user_id: user.id,
              storage_id: storage.id,
              source_id: source.id,
              content_type_id: contentType.id,
              source_item_id: item.source_item_id,
              item_id: item.id,
              error: error
            });

            callback(error);
          } else {
            self.storeItem(app, user, storage, source, contentType, item, callback);
          }
        });
      }
    }
  });
}

itemController.storeItem = function(app, user, storage, source, contentType, item, callback) {
  logger.trace('started to store item', {
    user_id: user.id,
    storage_id: storage.id,
    source_id: source.id,
    content_type_id: contentType.id,
    item_id: item.id
  });

  var storeCallback = function(response) {
    logger.trace('stored item', { 
      user_id: user.id,
      storage_id: storage.id,
      source_id: source.id,
      content_type_id: contentType.id,
      item_id: item.id,
      response: response
    });

    item.sync_verified_at = Date.now();
    item.bytes = response.bytes;
    item.path = response.path;
    item.save(function(error) {
      if (error) {
        logger.error('failed to update item after storing it', {
          user_id: user.id,
          storage_id: storage.id,
          source_id: source.id,
          content_type_id: contentType.id,
          item_id: item.id,
          error: error
        });

        callback(error);
      } else {
        app.emit('itemSyncVerified', item);

        logger.trace('updated item after storing it', {
          user_id: user.id,
          storage_id: storage.id,
          source_id: source.id,
          content_type_id: contentType.id,
          item_id: item.id
        });

        callback();
      }
    });
  };

  var error = function(error) {
    var message;

    if (typeof error != 'undefined') {
      message = error.message;
    }

    logger.error('failed to store item', { 
      user_id: user.id,
      storage_id: storage.id,
      source_id: source.id,
      content_type_id: contentType.id,
      item_id: item.id,
      message: message
    });

    item.sync_failed_at = Date.now();
    item.error = message;
    item.save(function(saveError) {
      if (saveError) {
        logger.error('failed to update item after failure to store it', {
          user_id: user.id,
          storage_id: storage.id,
          source_id: source.id,
          content_type_id: contentType.id,
          item_id: item.id,
          error: saveError 
        });
      }

      callback(error);
    });
  };

  var _error = error;

  UserStorageAuth.findOne({
    storage_id: storage.id,
    user_id:    user.id
  }, function(error, userStorageAuth) {
    if (error) {
      logger.error('failed to retrieve userStorageAuth for user while storing item');
      return _error(error);
    }

    var options = {
      host: storage.host,
      path: storage.path('/' + contentType.plural_id + '/' + source.id + '-' + item.id + '.json', userStorageAuth),
      method: 'PUT'
    };

    try {
      var req = https.request(options, function(res) {
        if (res.statusCode == 401) {
          _error(new Error('unauthorized request'));
        }

        var data = '';

        res.on('data', function(chunk) {
          data += chunk;
        });

        res.on('end', function() {
          try {
            storeCallback(JSON.parse(data));
          } catch(error) {
            logger.error('failed to parse store item response', { data: data });
            _error(error);
          }
        });
      }).on('error', function(error) {
        _error(error);
      });

      req.write(JSON.stringify(item.data));

      req.end();
    } catch (error) {
      _error(error);
    }
  });
}

module.exports = itemController;