var async = require('async'),
  debug = require('app/lib/debug')('app:itemController'),
  logger = require('app/lib/logger'),
  storeItemsPage = require('app/controllers/item/storeItemsPage'),
  validateParams = require('app/lib/validateParams');

/**
 * Store all items of contentType found from source for user.
 * Persist new Items in database for any not previously stored.
 * Emit event on app for each Item once stored.
 * @param {User} user - User for which to retrieve items from source and store them in storage.
 * @param {Source} source - Source from which to retrieve items.
 * @param {Storage} storage - Storage within which to store items.
 * @param {ContentType} contentType - ContentType of which to retrieve items.
 * @param {Job} [job] - Job for which to store items.
 * @param {callback} done
 */
module.exports = function(user, source, storage, contentType, job, done) {
  var log = logger.scopedLog();

  var validate = (done) => {
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

  var setupLog = (done) => {
    debug.start('storeAllForUserStorageSourceContentType');

    log = logger.scopedLog({
      user: user.id,
      source: source.id,
      storage: storage.id,
      contentType: contentType.id
    });

    done();
  };

  var storeAllItems = (done) => {
    var storeAllItemPages = function myself(error, pagination) {
      if (error) {
        if (done) {
          done(error);
        }
      } else {
        if (pagination) {
          storeItemsPage(user, source, storage, contentType, pagination, job, myself);
        } else if (done) {
          done();
        }
      }
    };

    storeAllItemPages(null, { offset: 0 });
  };

  async.series([validate, setupLog, storeAllItems], (error) => {
    if (error) {
      debug.error('storeAllForUserStorageSourceContentType (message: %s)', error.message);
      log('error', 'Item controller failed to store all items', { error: error });
    } else {
      debug.success('storeAllForUserStorageSourceContentType');
      log('milestone', 'Item controller stored all items', { error: error });
    }

    done(error);
  });
};
