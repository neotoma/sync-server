/**
 * Serves functions for manipulating items and related documents
 * @module
 */

/**
 * Error-first callback with data representing resource as second parameter.
 * @callback resourceCallback
 * @param {Error} error - Error encountered during attempt to retrieve resource
 * @param {Object} resource - Response body representing resource
 */

/**
 * Page of item data objects from source
 * @typedef {object} Page
 */

var _ = require('lodash');
var app = require('app');
var async = require('async');
var debug = require('app/lib/debug')('syncServer:itemController');
var Item = require('app/models/item');
var Job = require('app/models/job');
var kue = require('kue');
var logger = require('app/lib/logger');
var mime = require('app/lib/mime');
var request = require('app/lib/request');
var SourceContentType = require('app/models/sourceContentType');
var templateCompiler = require('es6-template-strings');
var Url = require('url');
var urlRegex = require('app/lib/urlRegex');
var UserSourceAuth = require('app/models/userSourceAuth');
var UserStorageAuth = require('app/models/userStorageAuth');
var validateParams = require('app/lib/validateParams');
var queue = kue.createQueue();

queue.process('storeItemData', function(queueJob, done) {
  debug('process queueJob %s', queueJob.id);

  var getItem = (done) => {
    Item.findById(queueJob.data.itemId, (error, item) => {
      if (error) {
        done(error);
      } else if (!item) {
        done(new Error('Item with queueJob.data.itemId not found'));
      } else {
        done(undefined, item);
      }
    });
  };

  var getJob = (item, done) => {
    Job.findById(queueJob.data.jobId, (error, job) => {
      if (error) {
        done(error);
      } else if (!job) {
        done(new Error('Job with queueJob.data.jobId not found'));
      } else {
        done(undefined, item, job);
      }
    });
  };

  var storeItemData = (item, job, done) => {
    debug.start('queueJob storeItemData', item.id, job.id);
    module.exports.storeItemData(item, queueJob.data.data, job, done);
  };

  async.waterfall([getItem, getJob, storeItemData], (error) => {
    if (error) {
      debug.error('failed to process queueJob %s: %s', queueJob.id, error.message);
    } else {
      debug.success('processed queueJob %s', queueJob.id);
    }

    done(error);
  });
});

queue.on('error', (error) => {
  debug.error('queueJob failed:', error.message);
});

/**
 * Callback resource found at URL.
 *That is: get resource from passed URL and pass to callback (done)
 * @param {string} url - URL of resource with extension that corresponds to a supported media type.
 * @param {module:controllers/item~resourceCallback} done
 */
module.exports.getResource = function(url, done) {
  var log = logger.scopedLog();

  var validate = function(done) {
    validateParams([{
      name: 'url', variable: url, required: true, requiredType: 'string', regex: urlRegex
    }], function(error) {
      if (!error && module.exports.hasSupportedMediaType(url) === false) {
        error = new Error('Parameter url indicates unsupported media type');
      }

      done(error);
    });
  };

  var setupLog = function(done) {
    debug.start('getResource %s', url);

    log = logger.scopedLog({
      url: url
    });

    done();
  };

  var getResource = function(done) {
    var mediaType = mime.lookup(url);
    mediaType = mediaType ? mediaType : 'application/json';

    request({
      url: url,
      headers: {
        'Content-Type': mediaType
      }
    }, function(error, res, body) {
      if (error) {
        return done(error);
      } else if (request.statusCodeError(res.statusCode)) {
        return done(request.statusCodeError(res.statusCode));
      }

      var resource;

      switch (mediaType) {
      case 'image/jpeg':
        resource = new Buffer(body);
        break;
      case 'application/json':
        try {
          resource = JSON.parse(body);
        } catch (error) {
          return done(new Error('Unable to parse resource'));
        }
        break;
      default:
        return done('Unrecognized media type encountered');
      }

      debug.success('getResource (mediaType: %s)', mediaType);
      done(undefined, resource);
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

/**
 * Return whether URL with extension indicates media type supported by controller operations.
 * @param {string} url - URL
 * @returns {boolean|undefined} Whether media type supported by controller operations
 */
module.exports.hasSupportedMediaType = function(url) {
  validateParams([{
    name: 'url', variable: url, required: true, requiredType: 'string'
  }]);

  var pathname = Url.parse(url).pathname;
  var lastSegment = (pathname.lastIndexOf('/') !== -1) ? pathname.substr(pathname.lastIndexOf('/') + 1) : pathname;

  if (lastSegment.indexOf('.') === -1) {
    return;
  }

  debug('hasSupportedMediaType url %s, mime %s', lastSegment, mime.lookup(lastSegment));

  return (['image/jpeg', 'application/json'].indexOf(mime.lookup(lastSegment)) !== -1);
};

/**
 * Return array of item data objects from within page object from source for contentType
 * @param {module:controllers/item~Page} page
 * @param {Source} source
 * @param {ContentType} contentType
 * @returns {Object[]} ItemDataObjects
 */
module.exports.itemDataObjectsFromPage = function(page, source, contentType) {
  validateParams([{
    name: 'page', variable: page, required: true, requiredType: 'object'
  }, {
    name: 'source', variable: source, required: true, requiredProperties: ['itemDataObjectsFromPagePathTemplate']
  }]);

  var path = source.itemDataObjectsFromPagePath(contentType);

  debug.trace('itemDataObjectsFromPage path: %s', path);

  var itemDataObjects = path ? _.get(page, path, []) : page;

  debug.trace('itemDataObjectsFromPage total: %s', itemDataObjects.length);

  return itemDataObjects;
};

/**
 * Return URL for making a GET request for items from source.
 * @param {Object} source - Source from which to retrieve items.
 * @param {Object} contentType - contentType of items.
 * @param {Object} userSourceAuth - UserSourceAuth used to make request.
 * @param {Object} pagination - Pagination used to make request.
 * @returns {string} URL for making a GET request
 */
module.exports.itemsGetUrl = function(source, contentType, userSourceAuth, pagination,done) {
  validateParams([{
    name: 'source', variable: source, required: true, requiredProperties: ['host']
  }, {
    name: 'contentType', variable: contentType, required: true, requiredProperties: ['name']
  }, {
    name: 'userSourceAuth', variable: userSourceAuth, required: true, requiredProperties: ['sourceToken']
  }, {
    name: 'pagination', variable: pagination
  }]);

  debug('getItemURL, source.authScope = %s', source.authScope);
  
  var property_next = (typeof pagination !== 'undefined' && pagination.next) ? pagination.next : undefined;

  if (property_next) {
    return done(undefined, property_next);
  } else {
    SourceContentType.findOne({
      contentType: contentType.id,
      source: source.id
    }, function(error, sourceContentType) {
      console.log("made it here",sourceContentType.itemsGetUrlTemplate);
      if (error) {
        return done(error);
      } else {
        var urlToReturn = templateCompiler(sourceContentType.itemsGetUrlTemplate,
          {
            sourceToken: userSourceAuth.sourceToken,
            apiVersion: source.apiVersion,
            contentTypePluralCamelName: sourceContentType.contentType.pluralCamelName(),
            contentTypePluralLowercaseName: sourceContentType.contentType.pluralLowercaseName(),
            sourceHost: source.host,
            sourceItemsLimit: source.itemsLimit,
            maxId: (typeof pagination !== 'undefined' && pagination.maxId) ? pagination.maxId : undefined,
            offset: (typeof pagination !== 'undefined' && pagination.offset) ? pagination.offset : 0,
            next: property_next,
            sourceName: source.name
          });
        return done(undefined, urlToReturn);
      }
    });
  }
};

/**
 * Returns total number of items available from page object returned by source.
 * Note: This is the total across all pages available from source, not just available within given page.
 * @param {Object} page - Page of items.
 * @param {source} source - Source of items page.
 * @param {Object} contentType - ContentType of items.
 * @returns {number} Total number of items available.
 */
module.exports.totalItemsAvailableFromPage = function(page, source, contentType) {
  validateParams([{
    name: 'page', variable: page, required: true, requiredType: 'object'
  }, {
    name: 'source', variable: source, required: true
  }]);

  var path = source.totalItemsAvailableFromPagePath(contentType);

  debug.trace('totalItemsAvailableFromPage path: %s', path);

  var total = path ? _.get(page, path) : page;

  debug.trace('totalItemsAvailableFromPage total: %s', total);

  return total;
};

/**
 * Returns error from items page if error exists within.
 * @param {Object} page - Items page.
 * @returns {error} Error
 */
module.exports.itemsPageError = function(page) {
  validateParams([{
    name: 'page', variable: page, required: true, requiredType: 'object'
  }]);

  if (page.meta && page.meta.code && Number(page.meta.code) >= 400) {
    var message;

    if (page.meta.errorDetail) {
      message = `${page.meta.errorDetail} (${page.meta.code})`;
    } else if (page.meta.errorType) {
      message = `HTTP status code ${page.meta.code}, ${page.meta.errorType}`;
    } else {
      message = `HTTP status code ${page.meta.code}`;
    }

    return new Error(message);
  }
};

/**
 * Returns pagination for next items page after current items page.
 * @param {Object} page - Current items page.
 * @param {Object} pagination - Pagination of current items page.
 * @param {Object} contentType - ContentType of current items page.
 * @returns {Object} Pagination for next items page.
 */
module.exports.itemsPageNextPagination = function(page, pagination, contentType) {
  validateParams([{
    name: 'page', variable: page, required: true, requiredType: 'object'
  }, {
    name: 'contentType', variable: contentType, requiredProperties: ['pluralCamelName']
  }]);

  var nextPagination;

  debug.start('itemsPageNextPagination (pagination: %o)', pagination);

  if (page.response && page.response[contentType.pluralLowercaseName()] && page.response[contentType.pluralLowercaseName()].items && page.response[contentType.pluralLowercaseName()].items.length) {
    if (pagination && pagination.offset) {
      nextPagination = { offset: pagination.offset + page.response[contentType.pluralLowercaseName()].items.length };
    } else {
      nextPagination = { offset: page.response[contentType.pluralLowercaseName()].items.length };
    }
  }

  if (page.data && page.data.pagination && page.data.pagination.next_max_id) {
    nextPagination = { maxId: page.data.pagination.next_max_id };
  }

  if (page.links && page.links.next) {
    nextPagination = { next: page.links.next };
  }

  if (page.paging && page.paging.next) {
    nextPagination = { next: page.paging.next };
  }

  debug.success('itemsPageNextPagination (nextPagination: %o)', nextPagination);

  return nextPagination;
};

/**
 * Callbacks file system path used to store item on storage.
 * @param {Item} item - Item.
 * @param {Object} data - Raw item data from source.
 * @param {function} done - Error-first callback function expecting file system path as second parameter.
 */
module.exports.storagePath = function(item, data, done) {
  var validate = function(done) {
    validateParams([{
      name: 'item', variable: item, required: true, requiredProperties: ['id', 'contentType']
    }], done);
  };

  var storagePath = function(done) {
    var path = '/' + item.source.kebabName() + '/' + item.contentType.pluralKebabName() + '/' + item.slug(data) + '.json';
    debug.success('storagePath: %s', path);
    done(undefined, path);
  };

  async.waterfall([validate, storagePath], done);
};

/**
 * Store all items of all supported contentTypes found from source for user.
 * Persist new Items in database for any not previously stored.
 * Emit event on app for each Item once stored.
 * @param {User} user - User for which to retrieve items from source and store them in storage.
 * @param {Source} source - Source from which to retrieve items.
 * @param {Storage} storage - Storage within which to store items.
 * @param {Job} [job] - Job for which to store items.
 * @param {callback} done
 */
module.exports.storeAllForUserStorageSource = function(user, source, storage, job, done) {
  var log = logger.scopedLog();

  var validate = function(done) {
    validateParams([{
      name: 'user', variable: user, required: true, requiredProperties: ['id']
    }, {
      name: 'source', variable: source, required: true, requiredProperties: ['id']
    }, {
      name: 'storage', variable: storage, required: true, requiredProperties: ['id']
    }], done);
  };

  var setupLog = function(done) {
    debug.start('storeAllForUserStorageSource');

    log = logger.scopedLog({
      user: user.id,
      source: source.id,
      storage: storage.id
    });

    done();
  };

  var storeAllForUserStorageContentType = function(contentType, done) {
    module.exports.storeAllForUserStorageContentType(user, source, storage, contentType, job, done);
  };

  var getContentTypes = function(done) {
    source.getContentTypes(done);
  };

  var storeAllItems = function(contentTypes, done) {
    debug.start('storeAllItems (contentTypes: %s)', contentTypes.length);
    async.eachSeries(contentTypes, storeAllForUserStorageContentType, done);
  };

  async.waterfall([validate, setupLog, getContentTypes, storeAllItems], function(error) {
    if (error) {
      log('error', 'Item controller failed to store all items', { error: error.message });
    } else {
      debug.success('storeAllForUserStorageSource');
    }

    done(error);
  });
};

/**
 * Store all items of contentType found from source for user.
 * Persist new Items in database for any not previously stored.
 * Emit event on app for each Item once stored.
 * @param {User} user - User for which to retrieve items from source and store them in storage.
 * @param {Source} source - Source from which to retrieve items.
 * @param {Storage} storage - Storage within which to store items.
 * @param {ContentType} contentType - contentType of which to retrieve items.
 * @param {Job} [job] - Job for which to store items.
 * @param {callback} done
 */
module.exports.storeAllForUserStorageContentType = function(user, source, storage, contentType, job, done) {
  debug('storeAllForUserStorageContentType, source = %s, storage = %s, contentType = %s', source, storage, contentType);
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
    }], done);
  };

  var setupLog = function(done) {
    debug.start('storeAllForUserStorageContentType');

    log = logger.scopedLog({
      user: user.id,
      source: source.id,
      storage: storage.id,
      contentType: contentType.id
    });

    done();
  };

  var storeAllItems = function(done) {
    var storeAllItemPages = function myself(error, pagination) {
      if (error) {
        if (done) {
          done(error);
        }
      } else {
        if (pagination) {
          module.exports.storeItemsPage(user, source, storage, contentType, pagination, job, myself);
        } else if (done) {
          done();
        }
      }
    };

    storeAllItemPages(null, { offset: 0 });
  };

  async.series([validate, setupLog, storeAllItems], function(error) {
    if (error) {
      debug.error('storeAllForUserStorageContentType (message: %s)', error.message);
      log('error', 'Item controller failed to store all items', { error: error });
    } else {
      debug.success('storeAllForUserStorageContentType');
      log('milestone', 'Item controller stored all items', { error: error });
    }

    done(error);
  });
};

/**
 * Store all items of contentType found from source for user.
 * Persist new Items in database for any not previously stored.
 * Emit event on app for each Item once stored.
 * @param {User} user - User for which to retrieve items from source and store them in storage.
 * @param {Source} source - Source from which to retrieve items.
 * @param {Storage} storage - Storage within which to store items.
 * @param {ContentType} contentType - contentType of which to retrieve items.
 * @param {Object} pagination – Object containing pagination information.
 * @param {Job} [job] - Job for which to store items.
 * @param {callback} done
 */
module.exports.storeItemsPage = function(user, source, storage, contentType, pagination, job, done) {
  var log = logger.scopedLog();
  var ids, page, userSourceAuth;

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
      name: 'pagination', variable: pagination, required: true
    }], done);
  };

  var setupLog = function(done) {
    debug.start('## storeItemsPage (contentType: %s, pagination: %o)', contentType.id, pagination);

    ids = {
      user: user.id,
      storage: storage.id,
      source: source.id,
      contentType: contentType.id
    };

    log = logger.scopedLog(Object.assign({}, pagination, ids));
    done();
  };

  var findUserSourceAuth = function(done) {
    UserSourceAuth.findOne({
      user: user.id,
      source: source.id
    }, function(error, foundUserSourceAuth) {
      if (!foundUserSourceAuth && !error) {
        error = new Error('Failed to find userSourceAuth');
      }

      userSourceAuth = foundUserSourceAuth;
      done(error);
    });
  };

  // get the page of date from URL
  // whcih will be converted INTO items

  var getItemsUrlFromTemplate = function(done) {
    module.exports.itemsGetUrl(source, contentType, userSourceAuth, pagination,done);
  };

  var getItemsPageResource = function(url, done) {
    module.exports.getResource(url, done);
  };

  var getItemDataObjects = function(resource, done) {
    page = resource;
    var error = module.exports.itemsPageError(page);

    if (error) {
      return done(new Error('Failed to retrieve valid item objects page. ' + error.message));
    }

    var itemDataObjects = module.exports.itemDataObjectsFromPage(page, source, contentType);
    var totalItemsAvailable = module.exports.totalItemsAvailableFromPage(page, source, contentType);

    if (job && totalItemsAvailable && pagination.offset === 0) {
      job.updateTotalItemsAvailable(totalItemsAvailable);
    }

    if (!itemDataObjects || !itemDataObjects.length) {
      debug.warning('storeItemsPage retrieved page with no data (contentType: %s, pagination: %o)', contentType.id, pagination);
    }

    done(undefined, itemDataObjects);
  };

  var persistItemDataObjects = function(itemDataObjects, done) {
    var count = 0;
    async.mapSeries(itemDataObjects, function(itemDataObject, done) {
      count++;
      debug('persistItemDataObject #%s', count);

      // this creates the Item mongo data document
      module.exports.persistItemDataObject(itemDataObject, {
        user: user,
        storage: storage,
        source: source,
        contentType: contentType
      }, (error, item) => {
        done(error, {
          item: item,
          data: itemDataObject
        });
      });
    }, done);
  };

  var storeItemsData = function(itemPairs, done) {
    async.each(itemPairs, function(itemPair, done) {
      var jobAttributes = {
        itemId: itemPair.item.id,
        data: itemPair.data
      };

      if (job) {
        jobAttributes.jobId = job.id;
      }
      // this is where the actual jobs queue "items" are created
      /// where the magic happens…
      var queueJob = queue.create('storeItemData', jobAttributes).save((error) => {
        if (error) {
          debug.error('queueJob %s failed to queue: %s', queueJob.id, error.message);
        } else {
          debug.success('queueJob %s queued for item %s', queueJob.id, itemPair.item.id);
        }
      });

      done();
    }, done);
  };

  var determineNextPagination = function(done) {
    done(undefined, module.exports.itemsPageNextPagination(page, pagination, contentType));
  };

  async.waterfall([
    validate,
    setupLog,
    findUserSourceAuth,
    getItemsUrlFromTemplate,
    getItemsPageResource,
    getItemDataObjects,
    persistItemDataObjects,
    storeItemsData,
    determineNextPagination
  ], function(error, nextPagination) {
    if (error) {
      log('error', 'Item controller failed to store page of items', { error: error.message });
    } else {
      debug.success('storeItemsPage (contentType: %s, pagination: %o, nextPagination: %o)', contentType.id, pagination, nextPagination);
    }

    done(error, nextPagination);
  });
};

/**
 * Persist an object representing Item data to the database and return corresponding Item.
 * Create new Item in database if none with corresponding IDs exists; otherwise retrieve existing Item.
 * Update Item with data provided by itemDataObject param before returning.
 * @param {Object} itemDataObject - Basic itemDataObject containing Item data.
 * @param {Object} relationships - Relationships to use for persistence of item with itemDataObject.
 * @param {function} done - Error-first callback function expecting Item as second parameter.
 */

// this creates the Item _about_ the data we're about to store, and saves this MongoDBx
module.exports.persistItemDataObject = function(itemDataObject, relationships, done) {
  var conditions;
  var log = logger.scopedLog();

  var validate = function(done) {
    validateParams([{
      name: 'itemDataObject', variable: itemDataObject, required: true, requiredProperties: ['id']
    }, {
      name: 'relationships',
      variable: relationships,
      required: true,
      requiredProperties: ['user', 'storage', 'source', 'contentType']
    }], done);
  };

  var compileConditions = function(done) {
    debug.start('persistItemDataObject');

    conditions = {
      user: relationships.user.id,
      storage: relationships.storage.id,
      source: relationships.source.id,
      contentType: relationships.contentType.id,
      sourceItem: itemDataObject.id
    };
    done();
  };

  var setupLog = function(done) {
    log = logger.scopedLog(conditions);
    done();
  };

  var persistItemDataObject = function(done) {
    Item.findOrCreate(conditions, function(error, item) {
      if (error) {
        done(error);
      } else {
        done(undefined, item);
      }
    });
  };

  var saveSourceCreatedAt = function(item, done) {
    var createdAt = itemDataObject.createdAt ? itemDataObject.createdAt * 1000 : null;
    createdAt = !createdAt && itemDataObject.created_time ? itemDataObject.created_time : createdAt;

    if (createdAt) {
      item.sourceCreatedAt = new Date(createdAt);
      item.save((error) => {
        done(error, item);
      });
    } else {
      done(undefined, item);
    }
  };

  var saveDescription = function(item, done) {
    if (itemDataObject) {
      var parts = [];

      if (itemDataObject.venue && itemDataObject.venue.name) {
        parts.push(itemDataObject.venue.name);
      } else if (itemDataObject.firstName || itemDataObject.lastName) {
        if (itemDataObject.firstName) {
          parts.push(itemDataObject.firstName);
        }

        if (itemDataObject.lastName) {
          parts.push(itemDataObject.lastName);
        }
      } else if (itemDataObject.text) {
        parts.push(itemDataObject.text);
      } else if (itemDataObject.message) {
        parts.push(itemDataObject.message);
      }

      item.description = parts.join(' ');
      item.save((error) => {
        done(error, item);
      });
    } else {
      done(undefined, item);
    }
  };

  var determinePath = function(item, done) {
    module.exports.storagePath(item, itemDataObject, function(error, path) {
      done(error, path, item);
    });
  };

  var savePath = function(path, item, done) {
    item.storagePath = path;
    item.save((error) => {
      done(error, item);
    });
  };

  async.waterfall([
    validate,
    compileConditions,
    setupLog,
    persistItemDataObject,
    saveSourceCreatedAt,
    saveDescription,
    determinePath,
    savePath
  ], function(error, item) {
    if (error) {
      log('error', 'Item controller failed to persist item data object', { error: error });
    } else {
      debug.success('persistItemDataObject', item);
    }

    done(error, item);
  });
};

/**
 * Store data for Item in storage.
 * Update attemptedAt, failedAt and verifiedAt timestamps as appropriate during process.
 * Update storageError if storage fails.
 * Update storageBytes and storagePath if storage succeeds.
 * @param {Item} item - Item object.
 * @param {Object} data - Raw item data from source.
 * @param {Job} [job] - Job for which to store items.
 * @param {callback} done
 */
// item is newly created item, data is the data for that item (from source)
module.exports.storeItemData = function(item, data, job, done) {
  var log = logger.scopedLog();

  var validate = function(done) {
    validateParams([{
      name: 'item', variable: item, required: true, requiredProperties: ['user', 'storage', 'save']
    }, {
      name: 'data', variable: data, required: true, requiredType: 'object'
    }], done);
  };

  var setupLog = function(done) {
    debug.start('storeItemData');
    log = logger.scopedLog({ item: item.id });
    done();
  };

  var updateStorageAttemptedAt = function(done) {
    item.storageAttemptedAt = Date.now();
    item.save(function(error) {
      done(error);
    });
  };
  // ?? what is going on here??
  var storeFile = function(done) {
    debug('storeFile : item.user = ', item.user);
    module.exports.storeFile(item.user, item.storage, item.storagePath, data, (error, storeFileResult) => {
      if (error) {
        debug.error('storeFile item %s, error %o, storeFileResult %o', item.id, error, storeFileResult);
        item.storageError = error.message;
        item.storageFailedAt = Date.now();
        item.save(() => {
          done(error, storeFileResult);
        });
      } else {
        done(undefined, storeFileResult);
      }
    });
  };

  var updateStorageProperties = function(storeFileResult, done) {
    item.storageVerifiedAt = Date.now();
    item.storageFailedAt = undefined;
    item.storageBytes = storeFileResult.size;
    item.storagePath = storeFileResult.path_lower;
    item.save(function(error) {
      if (!error) {
        debug.success('updateStorageProperties');
      }

      done(error);
    });
  };

  var updateJob = function(done) {
    if (job) {
      job.incrementTotalItemsStored();
    }

    done();
  };

  var notifyApp = function(done) {
    if (app && typeof app.emit === 'function') {
      app.emit('storedItemData', item, job);
      debug('app notified of storedItemData');
    } else {
      debug('app NOT notified of storedItemData');
    }

    done();
  };

  async.waterfall([
    validate,
    setupLog,
    updateStorageAttemptedAt,
    storeFile,
    updateStorageProperties,
    updateJob,
    notifyApp
  ], function(error) {
    if (error) {
      log('error', 'Item controller failed to storeItemData', { error: error.message });

      if (item && item.save) {
        item.storageFailedAt = Date.now();
        item.save(function(saveError) {
          if (saveError) {
            log('error', 'Item controller failed to update item after failure to store it', { error: saveError.message });
          }

          return done(error);
        });
      } else {
        done(error);
      }
    } else {
      debug.success('storeItemData');
      done();
    }
  });
};

/**
 * Store file to storage on behalf of user.
 * @param {User} user - User object.
 * @param {Object} storage - Storage object.
 * @param {string} path - Path to store file on storage.
 * @param {Object} data - Object that represents data for file.
 * @param {function} done - Error-first callback function with object representing HTTP response body from storage request as second parameter.
 */
module.exports.storeFile = function(user, storage, path, data, done) {
  var log = logger.scopedLog();

  var validate = function(done) {
    validateParams([{
      name: 'user', variable: user, required: true, requiredProperties: ['id']
    }, {
      name: 'storage', variable: storage, required: true, requiredProperties: ['id', 'host']
    }, {
      name: 'path', variable: path, required: true, requiredType: 'string'
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
        } else if (module.exports.hasSupportedMediaType(path) === false) {
          error = new Error('Parameter path extension indicates unsupported media type');
        }
      }

      done(error);
    });
  };

  var prepareData = function(done) {
    debug.start('storeFile (path: %s)', path);

    if (!(data instanceof Buffer)) {
      data = JSON.stringify(data);
    }

    done();
  };

  var setupLog = function(done) {
    log = logger.scopedLog({
      path: path,
      storage: storage.id,
      user: user.id
    });

    done();
  };

  var findUserStorageAuth = function(done) {
    UserStorageAuth.findOne({
      storage: storage.id,
      user: user.id
    }, function(error, userStorageAuth) {
      if (!error && !userStorageAuth) {
        error = new Error('Failed to retrieve userStorageAuth');
      }

      done(error, userStorageAuth);
    });
  };

  var storeFile = function(userStorageAuth, done) {
    var options = {
      body: data,
      headers: storage.headers(path, userStorageAuth),
      url: storage.itemPutUrl(path, userStorageAuth)
    };

    debug('storeFile:options %o', options);

    // what is going on t is ?????
    request.post(options, function(error, res, body) {
      if (!error) {
        error = request.statusCodeError(res.statusCode);
      }

      if (!error) {
        body = JSON.parse(body);
      }

      debug('storeFile body %o, error %o', body, error);

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
      log('error', 'Item controller failed to store file', { error: error.message, responseBody: responseBody });
    }

    done(error, responseBody);
  });
};