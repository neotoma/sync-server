require('../lib/prototypes/object.js');
require('../lib/prototypes/string.js');
var logger = require('../lib/logger');
var Status = require('../models/status');
var Item = require('../models/item');
var UserSourceAuth = require('../models/userSourceAuth');
var UserStorageAuth = require('../models/userStorageAuth');
var async = require('async');
var request = require('request');
var mime = require('mime-types');
var fs = require('fs');
var validateParams = require('../lib/validateParams');
var itemController = {};

itemController.successStatusCodes = [200, 201, 202];

itemController.isSupportedMediaType = function(type) {
  return (['image/jpeg','application/json'].indexOf(type) !== -1);
}

itemController.storagePath = function(item) {
  return '/' + pluralize(item.contentTypeId) + '/' + item.id + '.json'
};

/**
 * Store all items of all supported contentTypes found from source for user.
 * Persist new Items in database for any not previously stored.
 * Emit event on app for each Item once stored.
 * @param {User} user - User for which to retrieve items from source and store them in storage
 * @param {Source} source - Source from which to retrieve items
 * @param {Storage} storage - Storage within which to store items
 * @param {Object} app – App object on which to emit item storage events (optional)
 * @param {function} done - Error-first callback function expecting no additional parameters (optional)
 */
itemController.storeAllForUserStorageSource = function(user, source, storage, app, done) {
  var user = {};
  var controller = this;
  var log = logger.scopedLog({ arguments: arguments });

  var validate = function(done) {
    return done(new Error('validate error'));

    validateParams([{
      name: 'user', variable: user, required: true, requiredProperties: ['id']
    }, {
      name: 'source', variable: source, required: true, requiredProperties: ['id']
    }, {
      name: 'storage', variable: storage, required: true, requiredProperties: ['id']
    }, {
      name: 'app', variable: app, requiredProperties: [{ name: 'emit', type: 'function' }]
    }], done);
  };

  var setupLog = function(done) {
    return done(new Error('setupLog error'));

    log = logger.scopedLog({
      userId: user.id,
      sourceId: source.id,
      storageId: storage.id
    });

    done();
  };

  var storeAllItems = function(done) {
    return done(new Error('storeAllItems error'));

    log('trace', 'Item controller started to store all items of all contentTypes for user, storage and source');
    
    source.contentTypes.forEach(function(contentType) {
      controller.storeAllForUserStorageSourceContentType(user, source, storage, contentType, app, function(error) {
        if (done) {
          done(error);
        }
      });
    });
  };

  async.series([validate, setupLog, storeAllItems], function(error) {
    if (error) {
      log('error', 'Item controller failed to store all items of all contentTypes for user, storage and source', {
        error: error
      });
    } else {
      log('trace', 'Item controller stored all items of all contentTypes for user, storage and source');
    }

    done(error);
  });
};

/**
 * Store all items of contentType found from source for user.
 * Persist new Items in database for any not previously stored.
 * Emit event on app for each Item once stored.
 * @param {User} user - User for which to retrieve items from source and store them in storage
 * @param {Source} source - Source from which to retrieve items
 * @param {Storage} storage - Storage within which to store items
 * @param {ContentType} contentType - ContentType of which to retrieve items
 * @param {Object} app – App object on which to emit item storage events (optional)
 * @param {function} done - Error-first callback function expecting no additional parameters (optional)
 */
itemController.storeAllForUserStorageSourceContentType = function(user, source, storage, contentType, app, done) {
  var controller = this;

  logger.trace('Item controller started to store all items for user, storage, source and contentType', {
    userId: user.id,
    storageId: storage.id,
    sourceId: source.id,
    contentTypeId: contentType.id
  });

  var storeItemsPage = function myself(error, pagination) {
    if (error) {
      logger.error('Item controller failed to store page of items', {
        userId: user.id,
        storageId: storage.id,
        sourceId: source.id,
        contentTypeId: contentType.id,
        error: error
      });
    } else {
      controller.storeItemsPage(app, user, storage, source, contentType, pagination, myself);
    }
  }

  storeItemsPage(null, { offset: 0 });
};

itemController.storeItemsPage = function(app, user, storage, source, contentType, pagination, done) {
  var controller = this;

  var ids = {
    userId: user.id,
    storageId: storage.id,
    sourceId: source.id,
    contentTypeId: contentType.id
  };

  var log = logger.scopedLog(Object.assign({ pagination: pagination }, ids));

  log('trace', 'Item controller started to store page of items', { pagination: pagination });

  var findOrCreateStatus = function(done) {
    Status.findOrCreate(ids, done);
  };

  var findUserSourceAuth = function(status, done) {
    UserSourceAuth.findOne({
      userId: user.id,
      sourceId: source.id
    }, function(error, userSourceAuth) {
      if (!userSourceAuth && !error) {
        error = new Error('Item controller failed to find userSourceAuth while storing page of items');
      }

      done(error, userSourceAuth);
    });
  }

  var getItemsPage = function(userSourceAuth, done) {
    var path = source.itemsPagePath(contentType, userSourceAuth, pagination);

    if (!path) {
      return done('Item controller failed to determine itemsPagePath while storing page of items');
    }

    controller.getResource('https://' + source.host + path, done)   
  }

  var getItemObjects = function(page, done) {
    if (typeof page.meta.errorType !== 'undefined') {
      return done(new Error('Item controller failed to retrieve valid page while storing page of items'));
    }

    if (typeof page.response !== 'undefined') {
      var itemDataObjects = page.response[contentType.pluralId].items;
    } else if (typeof page.data !== 'undefined') {
      var itemDataObjects = page.data;
    }
    
    log('trace', 'Item controller parsed page while storing page of items', {
      totalItemObjects: itemObjects.length
    });

    if (pagination.offset === 0 && typeof page.response !== 'undefined') {
      status.totalItemsAvailable = page.response[contentType.pluralId].count;
      status.save();
    }

    done(null, itemDataObjects.map(function(itemDataObject) {
      return {
        data: itemDataObject,
        userId: user.id,
        storageId: storage.id,
        sourceId: source.id,
        contentTypeId: contentType.id
      };
    }));
  };

  var persistItemObject = function(itemObject, done) {
    if (typeof source.validItemObject !== 'undefined' && !source.validItemType(itemObject.type, contentType)) {
      log('warning', 'Item controller skipped invalid item while storing page of items');
      return done();
    }

    controller.persistItemObject(itemObject, done);
  };

  var persistItemObjects = function(itemObjects, done) {
    if (!itemObjects.length) {
      log('trace', 'Item controller found no items to persist while storing page of items');
      return done(null, []);
    }
    
    async.map(itemObjects, persistItemObject, done);
  };

  var storeItems = function(items, done) {
    async.each(items, function(item, done) {
      controller.storeItemData(item, function(error) {
        if (!error) {
          app.emit('itemSyncVerified', item);
        }

        done(error);
      });
    }, function(error) {
      done(error, items);
    });
  };

  var determineNextPagination = function(items, done) {
    var offset = pagination.offset;

    var nextPagination = {
      offset: offset + items.length
    };

    if (typeof pageData.pagination !== 'undefined') {
      if (typeof pageData.pagination.next_url !== 'undefined') {
        pagination.next_url = pageData.pagination.next_url;
      }

      if (typeof pageData.pagination.next_max_id !== 'undefined') {
        pagination.next_max_id = pageData.pagination.next_max_id;
      }
    }

    done(null, pagination);
  };

  async.waterfall([
    'findOrCreateStatus',
    'findUserSourceAuth',
    'getItemsPage',
    'persistItemObjects',
    'storeItems',
    'determineNextPagination'
  ], function(error, nextPagination) {
    if (error) {

    }

    done(error);
  });
};

/**
 * Persist an object representing Item data to the database and return corresponding Item.
 * Create new Item in database if none with corresponding IDs exists. Otherwise retrieve existing Item.
 * Update Item with data provided by object param before returning.
 * @param {Object} object - Basic object containing Item properties
 * @param {function} done - Error-first callback function expecting Item as second parameter
 */
itemController.persistItemObject = function(object, done) {
  validateParams([{
    name: 'object', variable: object, required: true, requiredProperties: ['userId', 'storageId', 'sourceId', 'contentTypeId', 'sourceItemId', 'data']
  }, {
    name: 'done', variable: done, required: true, requiredType: 'function'
  }]);

  var ids = {
    userId: object.userId,
    storageId: object.storageId,
    sourceId: object.sourceId,
    contentTypeId: object.contentTypeId,
    sourceItemId: object.sourceItemId,
  };

  var log = logger.scopedLog(ids);

  log('trace', 'Item controller started to persist item object');

  Item.findOrCreate(ids, function(error, item) {
    if (error) {
      log('error', 'Item controller failed to find or create item while persisting item object', { 
        error: error
      });

      done(error);
    } else {
      item.data = object.data;
      item.save(function(error) {
        if (error) {
          log('error', 'Item controller failed to save item while persisting item object');
          done(error);
        } else {
          done(null, item);
        }
      });
    }
  });
}

/**
 * Store data contained in property of Item in storage.
 * Skip storage if previous storage verified already.
 * Update attemptedAt, failedAt and verifiedAt timestamps as appropriate during process.
 * Update storageError if storage fails.
 * Update storageBytes and storagePath if storage succeeds.
 * @param {Item} item - Item object
 * @param {function} done - Error-first callback function expecting no additional parameters
 */
itemController.storeItemData = function(item, done) {
  var controller = this;

  validateParams([{
    name: 'item', variable: item, required: true, requiredProperties: ['id', 'userId', 'storageId', 'data', 'save']
  }, {
    name: 'done', variable: done, required: true, requiredType: 'function'
  }]);

  var log = logger.scopedLog({ itemId: item.id });

  if (item.storageVerifiedAt) {
    log('trace', 'Item controller skipped storing item data because storage already verified');
    return done();
  }

  var getUser = function(done) {
    User.findById(item.userId, done);
  };

  var getStorage = function(user, done) {
    try {
      done(null, user, require('../objects/storages/' + item.storageId));
    } catch (error) {
      done(new Error('Item controller failed to load storage for item before storing data'));
    }
  };

  var updateStorageAttemptedAt = function(user, storage, done) {
    item.storageAttemptedAt = Date.now();
    item.save(function(error) {
      done(error, user, storage);
    });
  };

  var storeFile = function(user, storage, done) {
    controller.storeFile(user, storage, item.dataStoragePath(), item.data, done);
  };

  var updateStorageProperties = function(storeFileResult, done) {
    item.storageVerifiedAt = Date.now();
    item.storageBytes = storeFileResult.bytes;
    item.storagePath = item.dataStoragePath();
    item.save(done);
  };

  log('trace', 'Item controller started to store item data');

  async.waterfall([
    getUser, 
    getStorage,
    updateStorageAttemptedAt,
    storeFile,
    updateStorageProperties
  ], function(error) {
    if (error) {
      log('error', 'Item controller failed to store item data', {
        error: error
      });

      item.storageFailedAt = Date.now();
      item.save(function(saveError) {
        if (saveError) {
          log('error', 'Item controller failed to update item after failure to store it', { error: saveError });
        }

        return done(error);
      });
    } else {
      log('trace', 'Item controller stored item data');
      done();
    }
  });
};

/**
 * Store file to storage on behalf of user.
 * @param {User} user - User object
 * @param {Storage} storage - Storage object
 * @param {string} path - Path to store file on storage
 * @param {Object} data - Object that represents data for file
 * @param {function} done - Error-first callback function with object representing HTTP response body from storage request as second parameter
 */
itemController.storeFile = function(user, storage, path, data, done) {
  var controller = this;

  validateParams([{
    name: 'user', variable: user, required: true, requiredProperties: ['id']
  }, {
    name: 'storage', variable: storage, required: true, requiredProperties: ['id', 'host', { name: 'path', type: 'function' }]
  }, {
    name: 'path', variable: path, required: true, requiredType: 'string', regex: /^\/[\w\/]*\w+\.\w+$/
  }, {
    name: 'data', variable: data, required: true, requiredType: ['buffer', 'object']
  }, {
    name: 'done', variable: done, required: true, requiredType: 'function'
  }]);

  var extension = path.split('.').pop();

  if (extension === 'jpg' && !(data instanceof Buffer)) {
    throw new Error('Path parameter with jpg extension not provided with binary data');
  } else if (extension === 'json' && (data instanceof Buffer)) {
    throw new Error('Path parameter with json extension not provided with parseable data');
  }

  if (!itemController.isSupportedMediaType(mime.lookup(extension))) {
    throw new Error('Parameter path extension indicates unsupported media type');
  }

  UserStorageAuth.findOne({
    storageId: storage.id,
    userId: user.id
  }, function(error, userStorageAuth) {
    try {
      if (error) {
        throw error;
      } else if(!userStorageAuth) {
        throw new Error('Item controller failed to retrieve userStorageAuth for user while storing file');
      }

      if (!(data instanceof Buffer)) {
        data = JSON.stringify(data);
      }

      var options = {
        url: 'https://' + storage.host + storage.path(path, userStorageAuth),
        body: data,
        headers: {
          'Content-Type': mime.lookup(extension)
        }
      };

      request.put(options, function(error, res) {
        if (error) {
          logger.error('Item controller failed to make request while storing file', {
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
          } else if (controller.successStatusCodes.indexOf(res.statusCode) === -1) {
            throw new Error('failed to confirm storage of file with indicative status code from storage');
          }

          done(null, JSON.parse(res.body));
        } catch (error) {
          logger.error('Item controller ' + error.message, {
            storageId: storage.id,
            userId: user.id,
            path: path
          });

          return done(new Error(error.message.capitalizeFirstLetter()));
        }
      });
    } catch (error) {
      logger.error(error.message, {
        userId: user.id,
        storageId: storage.id
      });
      return done(error);
    }
  });
};

/**
 * Return resource found at URL.
 * @param {string} URL of resource with extension that corresponds to a supported media type
 * @param {function} done - Error-first callback function with formatted data representing resource as second parameter
 */
itemController.getResource = function(url, done) {
  var controller = this;

  validateParams([{
    name: 'url', variable: url, required: true, requiredType: 'string'
  }, {
    name: 'done', variable: done, required: true, requiredType: 'function'
  }]);

  var extension = url.split('.').pop();

  if (!extension || extension === url) {
    throw new Error('Parameter url has no extension');
  }

  if (!itemController.isSupportedMediaType(mime.lookup(extension))) {
    throw new Error('Parameter url extension indicates unsupported media type');
  }

  var mediaType = mime.lookup(extension);

  request({
    url: url,
    headers: {
      'Content-Type': mediaType
    }
  }, function(error, res, body) {
    if (error) {
      logger.error('Item controller failed to make request while getting file', {
        error: error,
        url: url
      });

      return done(error);
    }

    try {
      if (res.statusCode === 401) {
        throw new Error('failed to get file because of unauthorized request');
      } else if (controller.successStatusCodes.indexOf(res.statusCode) === -1) {
        throw new Error('failed to get file');
      }

      switch(mediaType) {
        case 'application/json':
          body = JSON.parse(body);
          break;
        case 'image/jpeg':
          body = new Buffer(body);
          break;
      }

      done(null, body);
    } catch (error) {
      logger.error('Item controller ' + error.message, {
        url: url
      });

      done(new Error(error.message.capitalizeFirstLetter()));
    }
  });
};

module.exports = itemController;