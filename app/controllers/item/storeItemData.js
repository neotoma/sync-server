var _ = require('lodash'),
  async = require('async'),
  debug = require('app/lib/debug')('app:itemController'),
  logger = require('app/lib/logger'),
  storageId = require('app/controllers/item/storageId'),
  storeFile = require('app/controllers/item/storeFile'),
  validateParams = require('app/lib/validateParams');

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
module.exports = function(item, data, job, done) {
  // eslint-disable-next-line global-require
  var app = require('app'),
    log = logger.scopedLog();

  var validate = (done) => {
    validateParams([{
      name: 'item', variable: item, required: true, requiredProperties: ['user', 'storage', 'save']
    }, {
      name: 'data', variable: data, required: true, requiredType: 'object'
    }], done);
  };

  var setupLog = (done) => {
    debug.start('storeItemData');
    log = logger.scopedLog({ item: item.id });
    done();
  };

  var updateStorageAttemptedAt = (done) => {
    item.storageAttemptedAt = Date.now();
    item.save((error) => {
      done(error);
    });
  };

  var getStorageId = (done) => {
    storageId(item, data, done);
  };

  var formatData = (id, done) => {
    var formattedData = {
      'id': id,
      'type': item.contentType.pluralLowercaseName(),
      'attributes': {}
    };

    if (!item.contentType.dataTemplate) {
      formattedData.attributes = data;
      data = formattedData;
      return done(); 
    }

    var extractValue = (data, path) => {
      try {
        var value = path;
        var variables = path.match(/\$\{.+?\}/g);

        variables.forEach((variable) => {
          var matches = variable.match(/\$\{(.+?)\}/);
          var variableValue = _.get(data, matches[1]);

          if (!variableValue) {
            throw new Error('Variable value null or undefined');
          }

          debug.trace('replace %s with %s', variable, variableValue);
          value = value.replace(variable, _.get(data, matches[1]));
        });

        debug.trace('variables for %s: %o -> %s', path, variables, value);

        return value;
      } catch (error) {
        return _.get(data, path);
      }
    };

    Object.keys(item.contentType.dataTemplate).forEach((key) => {
      switch (typeof item.contentType.dataTemplate[key]) {
      case 'string':
        formattedData.attributes[key] = extractValue(data, item.contentType.dataTemplate[key]);
        break;

      case 'object':
        formattedData.attributes[key] = extractValue(data, item.contentType.dataTemplate[key]['path']);
            
        if (item.contentType.dataTemplate[key]['type'] === 'epoch') {
          debug.trace('converting epoch time: %s', formattedData.attributes[key]);
          var date = new Date(formattedData.attributes[key] * 1000);
          formattedData.attributes[key] = date.toISOString();
        }

        break;
      }
    });

    data = formattedData;
    done();
  };

  var runStoreFile = (done) => {
    storeFile(item.user, item.storage, item.storagePath, data, (error, storeFileResult) => {
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

  var updateStorageProperties = (storeFileResult, done) => {
    item.storageVerifiedAt = Date.now();
    item.storageFailedAt = undefined;
    item.storageBytes = storeFileResult.size;
    item.storagePath = storeFileResult.path_lower;
    item.save((error) => {
      if (!error) {
        debug.success('updateStorageProperties');
      }

      done(error);
    });
  };

  var updateJob = (done) => {
    if (job) {
      job.incrementTotalItemsStored();
    }

    done();
  };

  var notifyApp = (done) => {
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
    getStorageId,
    formatData,
    runStoreFile,
    updateStorageProperties,
    updateJob,
    notifyApp
  ], (error) => {
    if (error) {
      log('error', 'Item controller failed to storeItemData', { error: error.message });

      if (item && item.save) {
        item.storageFailedAt = Date.now();
        item.save((saveError) => {
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
