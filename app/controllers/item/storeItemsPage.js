var async = require('async'),
  debug = require('app/lib/debug')('app:itemController:storeItemsPage'),
  getResource = require('app/controllers/item/getResource'),
  Item = require('app/models/item'),
  itemDataObjectsFromPage = require('app/controllers/item/itemDataObjectsFromPage'),
  itemsGetUrl = require('app/controllers/item/itemsGetUrl'),
  itemsPageNextPagination = require('app/controllers/item/itemsPageNextPagination'),
  totalItemsAvailableFromPage = require('app/controllers/item/totalItemsAvailableFromPage'),
  itemsPageError = require('app/controllers/item/itemsPageError'),
  kue = require('kue'),
  logger = require('app/lib/logger'),
  persistItemDataObject = require('app/controllers/item/persistItemDataObject'),
  storeItemData = require('app/controllers/item/storeItemData'),
  UserSourceAuth = require('app/models/userSourceAuth'),
  validateParams = require('app/lib/validateParams');

var queue = kue.createQueue();

queue.process('storeItemData', (queueJob, done) => {
  // eslint-disable-next-line global-require
  var Job = require('app/models/job');
  
  debug('process queueJob %s with itemId %s and jobId', queueJob.id, queueJob.data.itemId, queueJob.data.jobId);

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
    if (!queueJob.data.jobId) { return done(undefined, item, undefined); }

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

  var runStoreItemData = (item, job, done) => {
    debug.start('queueJob storeItemData', item.id, job ? job.id : null);
    storeItemData(item, queueJob.data.data, job, done);
  };

  async.waterfall([getItem, getJob, runStoreItemData], (error) => {
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
 * Store all items of contentType found from source for user.
 * Persist new Items in database for any not previously stored.
 * Emit event on app for each Item once stored.
 * @param {User} user - User for which to retrieve items from source and store them in storage.
 * @param {Source} source - Source from which to retrieve items.
 * @param {Storage} storage - Storage within which to store items.
 * @param {ContentType} contentType - ContentType of which to retrieve items.
 * @param {Object} pagination – Object containing pagination information.
 * @param {Job} [job] - Job for which to store items.
 * @param {callback} done
 */
module.exports = function(user, source, storage, contentType, pagination, job, done) {
  var ids, page, userSourceAuth, log = logger.scopedLog();

  var validate = (done) => {
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

  var setupLog = (done) => {
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

  var findUserSourceAuth = (done) => {
    UserSourceAuth.findOne({
      user: user.id,
      source: source.id
    }, (error, foundUserSourceAuth) => {
      if (!foundUserSourceAuth && !error) {
        error = new Error('Failed to find userSourceAuth');
      }

      userSourceAuth = foundUserSourceAuth;
      done(error);
    });
  };

  var getItemsPageResource = (done) => {
    getResource(itemsGetUrl(source, contentType, userSourceAuth, pagination), done);
  };

  var getItemDataObjects = (resource, done) => {
    page = resource;
    var error = itemsPageError(page);

    if (error) {
      return done(new Error('Failed to retrieve valid item objects page. ' + error.message));
    }

    var itemDataObjects = itemDataObjectsFromPage(page, source, contentType);
    var totalItemsAvailable = totalItemsAvailableFromPage(page, source, contentType);

    if (job && totalItemsAvailable && pagination.offset === 0) {
      job.updateTotalItemsAvailable(totalItemsAvailable);
    }

    if (!itemDataObjects || !itemDataObjects.length) {
      debug.warning('storeItemsPage retrieved page with no data (contentType: %s, pagination: %o)', contentType.id, pagination);
    }

    done(undefined, itemDataObjects);
  };

  var persistItemDataObjects = (itemDataObjects, done) => {
    var count = 0;
    async.mapSeries(itemDataObjects, (itemDataObject, done) => {
      count++;
      debug('persisting itemDataObject #%s', count);
      
      persistItemDataObject(itemDataObject, {
        user: user,
        storage: storage,
        source: source,
        contentType: contentType
      }, (error, item) => {
        debug('persisted itemDataObject #%s with item ID %s', count, item.id);

        done(error, {
          item: item,
          data: itemDataObject
        });
      });
    }, done);
  };

  var storeItemsData = (itemPairs, done) => {
    async.each(itemPairs, (itemPair, done) => {
      var jobAttributes = {
        itemId: itemPair.item.id,
        data: itemPair.data
      };

      if (job) {
        jobAttributes.jobId = job.id;
      }

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

  var determineNextPagination = (done) => {
    done(undefined, itemsPageNextPagination(page, pagination, contentType));
  };

  async.waterfall([
    validate,
    setupLog,
    findUserSourceAuth,
    getItemsPageResource,
    getItemDataObjects,
    persistItemDataObjects,
    storeItemsData,
    determineNextPagination
  ], (error, nextPagination) => {
    if (error) {
      log('error', 'Item controller failed to store page of items', { error: error.message });
    } else {
      debug.success('storeItemsPage (contentType: %s, pagination: %o, nextPagination: %o)', contentType.id, pagination, nextPagination);
    }

    done(error, nextPagination);
  });
};
