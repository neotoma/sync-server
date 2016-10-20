require('../lib/prototypes/object.js');
require('../lib/prototypes/string.js');
var logger = require('../lib/logger');
var Status = require('../models/status');
var Item = require('../models/item');
var UserSourceAuth = require('../models/userSourceAuth');
var UserStorageAuth = require('../models/userStorageAuth');
var async = require('async');
var request = require('request');
var fs = require('fs');
var itemController = {};

itemController.syncAllForAllContentTypes = function(app, user, storage, source) {
  var self = this;

  try {
    logger.info('started to sync all items for all content types', {
      userId: user.id,
      storageId: storage.id,
      sourceId: source.id
    });

    source.contentTypes.forEach(function(contentType) {
      self.syncAll(app, user, storage, source, contentType);
    });
  } catch (error) {
    logger.error('failed to sync all items for all content types', {
      userId: user.id,
      storageId: storage.id,
      sourceId: source.id,
      error: error
    });
  }
};

itemController.syncAll = function(app, user, storage, source, contentType) {
  var self = this;

  logger.info('started to sync all items', {
    userId: user.id,
    storageId: storage.id,
    sourceId: source.id,
    contentTypeId: contentType.id
  });

  var syncPage = function myself(error, pagination) {
    if (error) {
      logger.error('failed to sync page of items', {
        userId: user.id,
        storageId: storage.id,
        sourceId: source.id,
        contentTypeId: contentType.id,
        error: error
      });
    } else {
      self.syncPage(app, user, storage, source, contentType, pagination, myself);
    }
  }

  syncPage(null, { offset: 0 });
}

itemController.syncPage = function(app, user, storage, source, contentType, pagination, callback) {
  var self = this;

  try {
    logger.trace('started to sync page of items', { 
      userId: user.id,
      storageId: storage.id,
      sourceId: source.id,
      contentTypeId: contentType.id,
      pagination: pagination
    });

    Status.findOrCreate({
      userId: user.id,
      storageId: storage.id,
      sourceId: source.id,
      contentTypeId: contentType.id
    }, function(error, status) {
      if (error) {
        logger.error('failed to find or create status while syncing page of items', {
          userId: user.id,
          storageId: storage.id,
          sourceId: source.id,
          contentTypeId: contentType.id,
          pagination: pagination
        });

        return callback(error);
      }
         
      UserSourceAuth.findOne({
        userId: user.id,
        sourceId: source.id
      }, function(error, userSourceAuth) {
        if (error || !userSourceAuth) {
          logger.error('failed to find userSourceAuth while syncing page of items', {
            userId: user.id,
            storageId: storage.id,
            sourceId: source.id,
            contentTypeId: contentType.id,
            pagination: pagination,
            error: error
          });

          if (!error) {
            error = new Error('failed to find userSourceAuth while syncing page of items');
          }

          return callback(error);
        }

        var path = source.itemsPagePath(contentType, userSourceAuth, pagination);

        if (!path) {
          return;
        }

        var url = 'https://' + source.host + path;

        self.getFile(url, function(error, data) {
          if (error) {
            var error = new Error('failed to retrieve page of items to sync');

            logger.error(error.message, {
              userId: user.id,
              storageId: storage.id,
              sourceId: source.id,
              contentTypeId: contentType.id,
              pagination: pagination,
              error: error
            });

            return callback(error);
          } else {
            try {
              var dataJSON = JSON.parse(data);
              
              if (typeof dataJSON.meta.errorType != 'undefined') {
                var error = new Error('failed to retrieve valid page of items to sync');
                
                logger.error(error.message, {
                  userId: user.id,
                  storageId: storage.id,
                  sourceId: source.id,
                  contentTypeId: contentType.id,
                  pagination: pagination,
                  errorType: dataJSON.meta.errorType,
                  errorDetail: dataJSON.meta.errorDetail,
                  errorType: dataJSON.meta.errorType
                });

                return callback(error);
              }

              if (typeof dataJSON.response !== 'undefined') {
                var itemsJSON = dataJSON.response[contentType.pluralId].items;
              } else if (typeof dataJSON.data !== 'undefined') {
                var itemsJSON = dataJSON.data;
              }
              
              logger.trace('parsed page of items to sync', {
                userId: user.id,
                storageId: storage.id,
                sourceId: source.id,
                contentTypeId: contentType.id,
                pagination: pagination,
                total: itemsJSON.length
              });

              if (pagination.offset === 0) {
                if (typeof dataJSON.response !== 'undefined') {
                  status.totalItemsAvailable = dataJSON.response[contentType.pluralId].count;
                }

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

                var offset = pagination.offset;

                async.each(itemsJSON, syncItem, function(error) {
                  var pagination = {
                    offset: offset + itemsJSON.length
                  };

                  if (typeof dataJSON.pagination !== 'undefined') {
                    if (typeof dataJSON.pagination.next_url !== 'undefined') {
                      pagination.next_url = dataJSON.pagination.next_url;
                    }

                    if (typeof dataJSON.pagination.next_max_id !== 'undefined') {
                      pagination.next_max_id = dataJSON.pagination.next_max_id;
                    }
                  }

                  callback(null, pagination);
                });
              } else {
                logger.trace('found no items to sync in page', { 
                  userId: user.id,
                  storageId: storage.id,
                  sourceId: source.id,
                  contentTypeId: contentType.id,
                  pagination: pagination
                });
              }
            } catch(error) {
              logger.error('failed to sync page of items', {
                error: error,
                userId: user.id,
                storageId: storage.id,
                sourceId: source.id,
                contentTypeId: contentType.id,
                pagination: pagination
              });
            }
          }
        })
      });
    });
  } catch (error) {
    logger.error('failed to sync page of items', {
      userId: user.id,
      storageId: storage.id,
      sourceId: source.id,
      contentTypeId: contentType.id,
      pagination: pagination,
      error: error
    });
  }
}

itemController.syncItem = function(app, user, storage, source, contentType, itemJSON, callback) {
  var self = this;

  if (typeof source.isValidItemJSON !== 'undefined' && !source.isValidItemJSON(itemJSON, contentType)) {
    return callback();
  }

  logger.trace('started to sync item', {
    userId: user.id,
    storageId: storage.id,
    sourceId: source.id,
    contentTypeId: contentType.id,
    sourceItemId: itemJSON.id
  });

  Item.findOrCreate({
    userId: user.id,
    storageId: storage.id,
    sourceId: source.id,
    contentTypeId: contentType.id,
    sourceItemId: itemJSON.id
  }, function(error, item) {
    if (error) {
      logger.error('failed to find or create item while syncing', { 
        error: error
      });

      callback(error);
    } else {
      if (item.syncVerifiedAt) {
        logger.trace('skipped syncing item because it is already verified', {
          userId: user.id,
          storageId: storage.id,
          sourceId: source.id,
          contentTypeId: contentType.id,
          sourceItemId: item.sourceItemId,
          item_id: item.id
        });

        callback();
      } else {
        item.data = itemJSON;
        item.description = source.itemDescription(item);
        item.syncAttemptedAt = Date.now();
        item.save(function(error) {
          if (error) {
            logger.error('failed to save item while syncing', {
              userId: user.id,
              storageId: storage.id,
              sourceId: source.id,
              contentTypeId: contentType.id,
              sourceItemId: item.sourceItemId,
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
  var self = this;

  logger.trace('started to store item', {
    userId: user.id,
    storageId: storage.id,
    sourceId: source.id,
    contentTypeId: contentType.id,
    item_id: item.id
  });

  var storeCallback = function(error, response) {
    if (error) {
      logger.error('failed to store item', { 
        userId: user.id,
        storageId: storage.id,
        sourceId: source.id,
        contentTypeId: contentType.id,
        item_id: item.id,
        message: error.message
      });

      item.syncFailedAt = Date.now();
      item.error = error.message;
      item.save(function(saveError) {
        if (saveError) {
          logger.error('failed to update item after failure to store it', {
            userId: user.id,
            storageId: storage.id,
            sourceId: source.id,
            contentTypeId: contentType.id,
            item_id: item.id,
            error: saveError 
          });
        }

        return callback(error);
      });
    }

    try {
      response = JSON.parse(JSON.stringify(response));
    } catch(error) {
      logger.error('failed to parse store item response', { response: response });
      return callback(error);
    }

    logger.trace('stored item', { 
      userId: user.id,
      storageId: storage.id,
      sourceId: source.id,
      contentTypeId: contentType.id,
      item_id: item.id,
      response: response
    });

    item.syncVerifiedAt = Date.now();
    item.bytes = response.bytes;
    item.path = response.path;
    item.save(function(error) {
      if (error) {
        logger.error('failed to update item after storing it', {
          userId: user.id,
          storageId: storage.id,
          sourceId: source.id,
          contentTypeId: contentType.id,
          item_id: item.id,
          error: error
        });

        callback(error);
      } else {
        app.emit('itemSyncVerified', item);

        logger.trace('updated item after storing it', {
          userId: user.id,
          storageId: storage.id,
          sourceId: source.id,
          contentTypeId: contentType.id,
          item_id: item.id
        });

        callback();
      }
    });
  };

  var path = '/' + contentType.pluralId + '/raw-synced-meta/' + item.id + '.json';
  this.storeFile(user, storage, path, item.data, storeCallback);

  if (typeof source.itemAssetLinks !== 'undefined') {
    for (var key in source.itemAssetLinks) {
      var url = Object.byString(item.data, source.itemAssetLinks[key]);
      var extension = url.split('.').pop();

      this.getFile(url, function(error, data) {
        if (error) {
          logger.error('failed to get item asset', {
            item_id: item.id,
            asset_url: url
          });

          callback(error);
        } else {
          var path = '/' + contentType.pluralId + '/' + item.id + '.' + extension;
          self.storeFile(user, storage, path, data, function(error, response) {
            if (error) {
              logger.error('failed to store item asset', {
                item_id: item.id,
                asset_url: url
              });
            } else {
              logger.trace('stored item asset', {
                item_id: item.id,
                asset_key: key,
                asset_url: url
              });
            }
          });
        }
      });
    }
  }
}

itemController.getFile = function(url, callback) {
  var extension = url.split('.').pop();
  var parsedUrl = require('url').parse(url);
  var contentType;

  if (extension === 'jpg') {
    contentType = 'image/jpeg';
  } else {
    contentType = 'application/json';
  }

  request.get({
    hostname: parsedUrl.hostname,
    path: parsedUrl.path,
    headers: {
      'Content-Type': contentType
    }
  }, function(error, res, body) {
    if (error) {
      logger.error('failed to get file', {
        error: error,
        url: url
      });

      return callback(error);
    }

    if (res.statusCode != 200) {
      logger.error('failed to get file with status code 200', {
        url: url
      });

      return callback(new Error('failed to get file'));
    }

    callback(null, body);
  });
}

itemController.storeFile = function(user, storage, path, data, done) {
  if (!user) {
    throw new Error('Parameter user undefined or null');
  }

  if (!user.id) {
    throw new Error('Parameter user has no id property');
  }

  if (!storage) {
    throw new Error('Parameter storage undefined or null');
  }

  if (!storage.id) {
    throw new Error('Parameter storage has no id property');
  }

  if (!storage.host) {
    throw new Error('Parameter storage has no host property');
  }

  if (!storage.path) {
    throw new Error('Parameter storage has no path property');
  }

  if (typeof storage.path !== 'function') {
    throw new Error('Property path of storage not a function');
  }

  if (!path) {
    throw new Error('Parameter path undefined or null');
  }

  if (typeof path !== 'string') {
    throw new Error('Parameter path not a string');
  }

  if (path.split('.').length > 2) {
    throw new Error('Parameter path has more than one period');
  }

  var extension = path.split('.').pop();
  var mimeTypes = {
    jpg: 'image/jpeg',
    json: 'application/json'
  }

  if (!extension || extension === path) {
    throw new Error('Parameter path lacks extension');
  }

  if (!mimeTypes[extension]) {
    throw new Error('Parameter path extension indicates unsupported MIME type');
  }

  if (!data) {
    throw new Error('Parameter data undefined or null');
  }

  if (typeof data !== 'object' && !(data instanceof Buffer)) {
    throw new Error('Parameter data not an object or buffer');
  }

  if (typeof done !== 'function') {
    throw new Error('Parameter done not a function');
  }

  if (extension === 'jpg' && !(data instanceof Buffer)) {
    throw new Error('Parameter extension jpg not provided with binary data');
  } else if (extension == 'json' && (data instanceof Buffer)) {
    throw new Error('Parameter extension json not provided with parseable data');
  }

  UserStorageAuth.findOne({
    storageId: storage.id,
    userId: user.id
  }, function(error, userStorageAuth) {
    if (error) {
      logger.error('Item controller failed to retrieve userStorageAuth for user while storing file');
      return done(error);
    }

    if (!(data instanceof Buffer)) {
      data = JSON.stringify(data);
    }

    var options = {
      url: 'https://' + storage.host + storage.path(path, userStorageAuth),
      headers: {
        'Content-Type': mimeTypes[extension]
      },
      body: data
    };

    request.put(options, function(error, res, body) {
      if (error) {
        logger.error('Item controller failed to make https request while storing file', {
          error: error,
          storageId: storage.id,
          userId: user.id,
          path: path
        });

        return done(error);
      }

      try {
        if (res.statusCode === 401) {
          throw new Error('failed to store file because of unauthorized request to storage');
        } else if ([200, 201, 202].indexOf(res.statusCode) === -1) {
          throw new Error('failed to confirm storage of file with indicative status code from storage');
        }
      } catch (error) {
        logger.error('Item controller ' + error.message, {
          storageId: storage.id,
          userId: user.id,
          path: path
        });

        return done(new Error(error.message.capitalizeFirstLetter()));
      }

      done(null, body);
    });
  });
}

module.exports = itemController;