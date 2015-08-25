var logger = require('../lib/logger');
var Status = require('../models/status');
var Item = require('../models/item');
var UserSourceAuth = require('../models/user-source-auth');
var UserStorageAuth = require('../models/user-storage-auth');
var https = require('https');
var async = require('async');
var itemController = {};

var fs = require('fs');

Object.byString = function(o, s) {
  // From: http://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key

  s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  s = s.replace(/^\./, '');           // strip a leading dot
  var a = s.split('.');
  for (var i = 0, n = a.length; i < n; ++i) {
      var k = a[i];
      if (k in o) {
          o = o[k];
      } else {
          return;
      }
  }
  return o;
}

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

  var syncPage = function myself(error, pagination) {
    if (error) {
      logger.error('failed to sync page of items', {
        user_id: user.id,
        storage_id: storage.id,
        source_id: source.id,
        content_type_id: contentType.id,
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
      user_id: user.id,
      storage_id: storage.id,
      source_id: source.id,
      content_type_id: contentType.id,
      pagination: pagination
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
          pagination: pagination
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
              user_id: user.id,
              storage_id: storage.id,
              source_id: source.id,
              content_type_id: contentType.id,
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
                  user_id: user.id,
                  storage_id: storage.id,
                  source_id: source.id,
                  content_type_id: contentType.id,
                  pagination: pagination,
                  errorType: dataJSON.meta.errorType,
                  errorDetail: dataJSON.meta.errorDetail,
                  errorType: dataJSON.meta.errorType
                });

                return callback(error);
              }

              if (typeof dataJSON.response !== 'undefined') {
                var itemsJSON = dataJSON.response[contentType.plural_id].items;
              } else if (typeof dataJSON.data !== 'undefined') {
                var itemsJSON = dataJSON.data;
              }
              
              logger.trace('parsed page of items to sync', {
                user_id: user.id,
                storage_id: storage.id,
                source_id: source.id,
                content_type_id: contentType.id,
                pagination: pagination,
                total: itemsJSON.length
              });

              if (pagination.offset == 0) {
                if (typeof dataJSON.response !== 'undefined') {
                  status.total_items_available = dataJSON.response[contentType.plural_id].count;
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
                  user_id: user.id,
                  storage_id: storage.id,
                  source_id: source.id,
                  content_type_id: contentType.id,
                  pagination: pagination
                });
              }
            } catch(error) {
              logger.error('failed to sync page of items', {
                error: error,
                user_id: user.id,
                storage_id: storage.id,
                source_id: source.id,
                content_type_id: contentType.id,
                pagination: pagination
              });
            }
          }
        })
      });
    });
  } catch (error) {
    logger.error('failed to sync page of items', {
      user_id: user.id,
      storage_id: storage.id,
      source_id: source.id,
      content_type_id: contentType.id,
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
        item.description = source.itemDescription(item);
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
  var self = this;

  logger.trace('started to store item', {
    user_id: user.id,
    storage_id: storage.id,
    source_id: source.id,
    content_type_id: contentType.id,
    item_id: item.id
  });

  var storeCallback = function(error, response) {
    if (error) {
      logger.error('failed to store item', { 
        user_id: user.id,
        storage_id: storage.id,
        source_id: source.id,
        content_type_id: contentType.id,
        item_id: item.id,
        message: error.message
      });

      item.sync_failed_at = Date.now();
      item.error = error.message;
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

  var path = '/' + contentType.plural_id + '/raw-synced-meta/' + item.id + '.json';
  this.storeFile(user, storage, path, item.data, 'utf8', storeCallback);

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
          var path = '/' + contentType.plural_id + '/' + item.id + '.' + extension;
          self.storeFile(user, storage, path, data, 'binary', function(error, response) {
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

  if (extension == 'jpg') {
    contentType = 'image/jpeg';
  } else {
    contentType = 'application/json';
  }

  https.get({
    hostname: parsedUrl.hostname,
    path: parsedUrl.path,
    headers: {
      'Content-Type': contentType
    }
  }, function(res) {
    if (res.statusCode != 200) {
      logger.error('failed to get file with status code 200', {
        url: url
      });

      return callback(new Error('failed to get file'));
    }

    var data = '';

    if (extension == 'jpg') {
      res.setEncoding('binary');
    }

    res.on('data', function(chunk) {
      data += chunk;
    });

    res.on('end', function() {
      callback(null, data);
    });
  }).on('error', function(error) {
    logger.error('failed to get file', {
      error: error,
      url: url
    });

    callback(error);
  });
}

itemController.storeFile = function(user, storage, path, data, encoding, callback) {
  var extension = path.split('.').pop();
  var contentType;

  if (extension == 'jpg') {
    contentType = 'image/jpeg';
  } else {
    contentType = 'application/json';
  }

  UserStorageAuth.findOne({
    storage_id: storage.id,
    user_id:    user.id
  }, function(error, userStorageAuth) {
    if (error) {
      logger.error('failed to retrieve userStorageAuth for user while storing file');
      return callback(error);
    }

    if (encoding == 'binary') {
      fs.writeFile('/Users/markhendrickson/Desktop/binary/1.jpg', data, 'binary', function(error) {
        if (error) { 
          logger.error('failed to write binary file to disk');
        } else {
          logger.trace('wrote binary file to disk');
        }
      });
    }

    var options = {
      host: storage.host,
      path: storage.path(path, userStorageAuth),
      method: 'PUT',
      headers: {
        'Content-Type': contentType
      }
    };

    try {
      var req = https.request(options, function(res) {
        if (res.statusCode == 401) {
          return callback(new Error('unauthorized request'));
        }

        var data = '';

        res.on('data', function(chunk) {
          data += chunk;
        });

        res.on('end', function() {
          callback(null, data);
        });
      }).on('error', function(error) {
        return callback(error);
      });

      if (encoding == 'utf8') {
        data = JSON.stringify(data);
      }

      req.write(data);
      req.end();
    } catch (error) {
      return callback(error);
    }
  });
}

module.exports = itemController;