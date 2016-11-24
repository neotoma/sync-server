require('../lib/prototypes/object.js');
require('../lib/prototypes/string.js');
var logger = require('../lib/logger');
var Status = require('../models/status');
var User = require('../models/user');
var Item = require('../models/item');
var UserSourceAuth = require('../models/userSourceAuth');
var UserStorageAuth = require('../models/userStorageAuth');
var async = require('async');
var pluralize = require('pluralize');
var request = require('../lib/request');
var mime = require('mime-types');
var urlParser = require('url');
var fs = require('fs');
var validateParams = require('../lib/validateParams');
var urlRegex = require('../lib/urlRegex');
var itemController = {};

/**
 * Returns whether URL with extension indicates media type supported by controller operations
 * If able to determine media type with extension, returns boolean.
 * If unable to determine media type with extension, returns no value.
 * @param {string} url - URL
 */
itemController.hasSupportedMediaType = function(url) {
  validateParams([{
    name: 'url', variable: url, required: true, requiredType: 'string'
  }]);

  if (urlParser.parse(url).pathname.indexOf('.') === -1) {
    return;
  }

  return (['image/jpeg', 'application/json'].indexOf(mime.lookup(url)) !== -1);
};

/**
 * Returns file system path used to store item on storage
 * @param {Item} item - Item
 */ 
itemController.storagePath = function(item) {
  validateParams([{
    name: 'item', variable: item, required: true, requiredProperties: ['id', 'contentTypeId']
  }]);

  return '/' + pluralize(item.contentTypeId) + '/' + item.id + '.json';
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
  var controller = this;
  var log = logger.scopedLog();

  var validate = function(done) {
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
    log = logger.scopedLog({
      userId: user.id,
      sourceId: source.id,
      storageId: storage.id
    });

    done();
  };

  var storeAllItems = function(done) {
    log('trace', 'Item controller started to store all items');
    
    async.eachSeries(source.contentTypes, function(contentType, done) {
      controller.storeAllForUserStorageSourceContentType(user, source, storage, contentType, app, done);
    }, done);
  };

  async.series([validate, setupLog, storeAllItems], function(error) {
    if (error) {
      log('error', 'Item controller failed to store all items', { error: error });
    } else {
      log('trace', 'Item controller stored all items');
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
  var log = logger.scopedLog();

  var validate = function(done) {
    validateParams([{
      name: 'user', variable: user, required: true, requiredProperties: ['id']
    }, {
      name: 'source', variable: source, required: true, requiredProperties: ['id']
    }, {
      name: 'storage', variable: storage, required: true, requiredProperties: ['id']
    }, {
      name: 'contentType', variable: contentType, required: true, requiredProperties: ['id']
    }, {
      name: 'app', variable: app, requiredProperties: [{ name: 'emit', type: 'function' }]
    }], done);
  };

  var setupLog = function(done) {
    log = logger.scopedLog({
      userId: user.id,
      sourceId: source.id,
      storageId: storage.id,
      contentTypeId: contentType.id
    });

    done();
  };

  var storeAllItems = function(done) {
    log('trace', 'Item controller started to store all items');

    var storeAllItemsPages = function myself(error, pagination) {
      if (error) {
        log('error', 'Item controller failed to store page of items', { error: error });

        if (done) {
          done(error);
        }
      } else {
        if (pagination) {
          controller.storeItemsPage(user, source, storage, contentType, pagination, app, myself);
        } else if (done) {
          done();
        }
      }
    }

    storeAllItemsPages(null, { offset: 0 });
  };

  async.series([validate, setupLog, storeAllItems], function(error) {
    if (error) {
      log('error', 'Item controller failed to store all items', { error: error });
    } else {
      log('trace', 'Item controller stored all items');
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
 * @param {Object} pagination – Object containing pagination information
 * @param {Object} app – App object on which to emit item storage events (optional)
 * @param {function} done - Error-first callback function expecting nextPagination object as second parameter (optional)
 */
itemController.storeItemsPage = function(user, source, storage, contentType, pagination, app, done) {
  var controller = this;
  var log = logger.scopedLog();
  var ids, page, userSourceAuth, status;

  var validate = function(done) {
    validateParams([{
      name: 'user', variable: user, required: true, requiredProperties: ['id']
    }, {
      name: 'source', variable: source, required: true, requiredProperties: ['id', 'itemsPageUrl']
    }, {
      name: 'storage', variable: storage, required: true, requiredProperties: ['id']
    }, {
      name: 'contentType', variable: contentType, required: true, requiredProperties: ['id']
    }, {
      name: 'pagination', variable: pagination, required: true
    }, {
      name: 'app', variable: app, requiredProperties: [{ name: 'emit', type: 'function' }]
    }], done);
  };

  var setupLog = function(done) {
    ids = {
      userId: user.id,
      storageId: storage.id,
      sourceId: source.id,
      contentTypeId: contentType.id
    };

    log = logger.scopedLog(Object.assign({ pagination: pagination }, ids));
    log('trace', 'Item controller started to store page of items');
    done();
  };

  var findOrCreateStatus = function(done) {
    Status.findOrCreate(ids, function(error, foundOrCreatedStatus) {
      status = foundOrCreatedStatus;
      done(error);
    });
  };

  var findUserSourceAuth = function(done) {
    UserSourceAuth.findOne({
      userId: user.id,
      sourceId: source.id
    }, function(error, foundUserSourceAuth) {
      if (!foundUserSourceAuth && !error) {
        error = new Error('Failed to find userSourceAuth');
      }

      userSourceAuth = foundUserSourceAuth;
      done(error);
    });
  }

  var getItemsPageResource = function(done) {
    var url = source.itemsPageUrl(contentType, userSourceAuth, pagination);

    if (!url) {
      return done('Failed to determine source.itemsPageUrl');
    }

    controller.getResource(url, done);
  }

  var getItemObjects = function(resource, done) {
    page = resource;
    var error = source.itemsPageError(page);

    if (error) {
      return done(new Error('Failed to retrieve valid page: ' + error.message));
    }

    var itemDataObjects = source.itemsPageDataObjects(page, contentType);

    if (!itemDataObjects) {
      itemDataObjects = [];
    }

    if (pagination.offset === 0) {
      status.totalItemsAvailable = source.itemsPageTotalAvailable(page, contentType);
      status.save();
    }

    itemDataObjects = itemDataObjects.filter(function(itemDataObject) {
      return (itemDataObject.type === contentType.id);
    });

    if (!itemDataObjects || !itemDataObjects.length) {
      log('trace', 'Item controller retrieved page with no data to persist while storing page of items');
    }

    done(undefined, itemDataObjects.map(function(data) {
      return {
        data: data,
        userId: user.id,
        storageId: storage.id,
        sourceId: source.id,
        contentTypeId: contentType.id,
        sourceItemId: data.id
      };
    }));
  };

  var persistItemObjects = function(itemObjects, done) {
    async.mapSeries(itemObjects, controller.persistItemObject, done);
  };

  var storeItemsData = function(items, done) {
    async.eachSeries(items, function(item, done) {
      controller.storeItemData(item, app, done);
    }, done);
  };

  var determineNextPagination = function(done) {
    done(null, source.itemsPageNextPagination(page, contentType, pagination));
  };

  async.waterfall([
    validate,
    setupLog,
    findOrCreateStatus,
    findUserSourceAuth,
    getItemsPageResource,
    getItemObjects,
    persistItemObjects,
    storeItemsData,
    determineNextPagination
  ], function(error, nextPagination) {
    if (error) {
      log('error', 'Item controller failed to store page of items', { error: error });
    }

    done(error, nextPagination);
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
  var ids;
  var log = logger.scopedLog();

  var test = function(done) {
    done();
  };

  var validate = function(done) {
    validateParams([{
      name: 'object', variable: object, required: true, requiredProperties: ['userId', 'storageId', 'sourceId', 'contentTypeId', 'sourceItemId', 'data']
    }], done);
  };

  var collectIds = function(done) {
    ids = {
      userId: object.userId,
      storageId: object.storageId,
      sourceId: object.sourceId,
      contentTypeId: object.contentTypeId,
      sourceItemId: object.sourceItemId,
    };
    done();
  };

  var setupLog = function(done) {
    log = logger.scopedLog(ids);
    done();
  };

  var persistItemObject = function(done) {
    Item.findOrCreate(ids, function(error, item) {
      if (error) {
        done(error);
      } else {
        item.data = object.data;
        item.save(function(error) {
          done(error, item);
        });
      }
    });
  };

  async.waterfall([
    test,
    validate,
    collectIds,
    setupLog,
    persistItemObject
  ], function(error, item) {
    if (error) {
      log('error', 'Item controller failed to persist item object', { error: error });
    }

    done(error, item);
  });
}

/**
 * Store data contained in property of Item in storage.
 * Update attemptedAt, failedAt and verifiedAt timestamps as appropriate during process.
 * Update storageError if storage fails.
 * Update storageBytes and storagePath if storage succeeds.
 * @param {Item} item - Item object
 * @param {Object} app – App object on which to emit item storage events (optional)
 * @param {function} done - Error-first callback function expecting no additional parameters
 */
itemController.storeItemData = function(item, app, done) {
  var controller = this;
  var log = logger.scopedLog();

  var validate = function(done) {
    validateParams([{
      name: 'item', variable: item, required: true, requiredProperties: ['userId', 'storageId', 'data', 'save']
    }], done);
  };

  var setupLog = function(done) {
    log = logger.scopedLog({ itemId: item.id });
    done();
  };

  var getUser = function(done) {
    User.findById(item.userId, function(error, user) {
      if (!error && !user) {
        error = new Error('No user found for item');
      }
      
      done(error, user);
    });
  };

  var getStorage = function(user, done) {
    try {
      done(undefined, user, require('../objects/storages/' + item.storageId));
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
    controller.storeFile(user, storage, itemController.storagePath(item), item.data, done);
  };

  var updateStorageProperties = function(storeFileResult, done) {
    item.storageVerifiedAt = Date.now();
    item.storageFailedAt = undefined;
    item.storageBytes = storeFileResult.bytes;
    item.save(function(error) {
      done(error);
    });
  };

  var notifyApp = function(done) {
    if (app && typeof app.emit === 'function') {
      app.emit('storedItemData', item);
    }

    done();
  };

  log('trace', 'Item controller started to store item data');

  async.waterfall([
    validate,
    setupLog,
    getUser, 
    getStorage,
    updateStorageAttemptedAt,
    storeFile,
    updateStorageProperties,
    notifyApp
  ], function(error) {
    if (error) {
      log('error', 'Item controller failed to storeItemData', { error: error });

      if (item && item.save) {
        item.storageFailedAt = Date.now();
        item.save(function(saveError) {
          if (saveError) {
            log('error', 'Item controller failed to update item after failure to store it', { error: saveError });
          }

          return done(error);
        });
      } else {
        done(error);
      }
    } else {
      log('trace', 'Item controller succeeded to storeItemData');
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
  var log = logger.scopedLog();

  var validate = function(done) {
    validateParams([{
      name: 'user', variable: user, required: true, requiredProperties: ['id']
    }, {
      name: 'storage', variable: storage, required: true, requiredProperties: ['id', 'host', { name: 'itemUrl', type: 'function' }]
    }, {
      name: 'path', variable: path, required: true, requiredType: 'string', regex: /^\/[\w\/]*\w+\.\w+$/
    }, {
      name: 'data', variable: data, required: true, requiredType: ['buffer', 'object']
    }, {
      name: 'done', variable: done, required: true, requiredType: 'function'
    }], function(error) {
      if (!error) {
        var mediaType = mime.lookup(path);

        if (mediaType === 'image/jpeg' && !(data instanceof Buffer)) {
          error = new Error('Path parameter with jpg extension not provided with binary data');
        } else if (mediaType === 'application/json' && (data instanceof Buffer)) {
          error = new Error('Path parameter with json extension not provided with parseable data');
        } else if (itemController.hasSupportedMediaType(path) === false) {
          error = new Error('Parameter path extension indicates unsupported media type');
        }
      }

      done(error);
    });
  };

  var prepareData = function(done) {
    if (!(data instanceof Buffer)) {
      data = JSON.stringify(data);
    }

    done();
  };

  var setupLog = function(done) {
    log = logger.scopedLog({
      path: path,
      storageId: storage.id,
      userId: user.id
    });

    done();
  };

  var findUserStorageAuth = function(done) {
    UserStorageAuth.findOne({
      storageId: storage.id,
      userId: user.id
    }, function(error, userStorageAuth) {
      if(!error && !userStorageAuth) {
        error = new Error('Failed to retrieve userStorageAuth');
      }

      done(error, userStorageAuth);
    });
  };

  var storeFile = function(userStorageAuth, done) {
    var options = {
      url: storage.itemUrl(path, userStorageAuth),
      body: data,
      headers: { 'Content-Type': mime.lookup(path) }
    };

    request.put(options, function(error, res, body) {
      if (!error) {
        error = request.statusCodeError(res.statusCode);
      }

      if (!error) {
        body = JSON.parse(body);
      }

      done(error, body);
    });
  };

  async.waterfall([
    validate,
    prepareData,
    setupLog,
    findUserStorageAuth,
    storeFile
  ], function(error, responseBody) {
    if (error) {
      log('error', 'Item controller failed to store file', { error: error }); 
    }

    done(error, responseBody);
  });
};

/**
 * Return resource found at URL.
 * @param {string} URL of resource with extension that corresponds to a supported media type
 * @param {function} done - Error-first callback function with formatted data representing resource as second parameter
 */
itemController.getResource = function(url, done) {
  var controller = this;
  var log = logger.scopedLog();

  var validate = function(done) {
    validateParams([{
      name: 'url', variable: url, required: true, requiredType: 'string', regex: urlRegex
    }], function(error) {
      if (!error && itemController.hasSupportedMediaType(url) === false) {
        error = new Error('Parameter url indicates unsupported media type');
      }

      done(error);
    });
  };

  var setupLog = function(done) {
    log = logger.scopedLog({
      url: url
    });

    done();
  };

  var getResource = function(done) {
    var mediaType = mime.lookup(url);

    request({
      url: url,
      headers: {
        'Content-Type': mediaType
      }
    }, function(error, res, body) {
      if (!error) {
        error = request.statusCodeError(res.statusCode);
      }

      if (!error) {
        switch(mediaType) {
          case 'image/jpeg':
            body = new Buffer(body);
            break;
          default:
            try {
              body = JSON.parse(body);
            } catch (error) {}
            break;
        }
      }

      done(error, body);
    });
  };

  async.waterfall([
    validate, 
    setupLog,
    getResource
  ], function(error, resource) {
    if (error) {
      log('error', 'Item controller failed to get resource', { error: error }); 
    }

    done(error, resource);
  });
};

module.exports = itemController;