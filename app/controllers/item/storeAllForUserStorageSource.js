var async = require('async'),
  debug = require('app/lib/debug')('app:itemController'),
  logger = require('app/lib/logger'),
  storeAllForUserStorageSourceContentType = require('app/controllers/item/storeAllForUserStorageSourceContentType'),
  validateParams = require('app/lib/validateParams');

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
module.exports = function(user, source, storage, job, done) {
  var log = logger.scopedLog();

  var validate = (done) => {
    validateParams([{
      name: 'user', variable: user, required: true, requiredProperties: ['id']
    }, {
      name: 'source', variable: source, required: true, requiredProperties: ['id']
    }, {
      name: 'storage', variable: storage, required: true, requiredProperties: ['id']
    }], done);
  };

  var setupLog = (done) => {
    debug.start('storeAllForUserStorageSource');

    log = logger.scopedLog({
      user: user.id,
      source: source.id,
      storage: storage.id
    });

    done();
  };

  var runStoreAllForUserStorageSourceContentType = (contentType, done) => {
    storeAllForUserStorageSourceContentType(user, source, storage, contentType, job, done);
  };

  var storeAllItems = (done) => {
    debug.start('storeAllItems (contentTypes: %s)', source.contentTypes.length);
    async.eachSeries(source.contentTypes, runStoreAllForUserStorageSourceContentType, done);
  };

  async.waterfall([validate, setupLog, storeAllItems], (error) => {
    if (error) {
      log('error', 'Item controller failed to store all items', { error: error.message });
    } else {
      debug.success('storeAllForUserStorageSource');
    }

    done(error);
  });
};
