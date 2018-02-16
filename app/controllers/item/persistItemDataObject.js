var async = require('async'),
  debug = require('app/lib/debug')('app:itemController'),
  Item = require('app/models/item'),
  logger = require('app/lib/logger'),
  storagePath = require('app/controllers/item/storagePath'),
  validateParams = require('app/lib/validateParams');

/**
 * Persist an object representing Item data to the database and return corresponding Item.
 * Create new Item in database if none with corresponding IDs exists; otherwise retrieve existing Item.
 * Update Item with data provided by itemDataObject param before returning.
 * @param {Object} itemDataObject - Basic itemDataObject containing Item data.
 * @param {Object} relationships - Relationships to use for persistence of item with itemDataObject.
 * @param {function} done - Error-first callback function expecting Item as second parameter.
 */
module.exports = function(itemDataObject, relationships, done) {
  var conditions;
  var log = logger.scopedLog();

  var validate = (done) => {
    validateParams([{
      name: 'itemDataObject', variable: itemDataObject, required: true, requiredProperties: ['id']
    }, {
      name: 'relationships', variable: relationships, required: true, requiredProperties: ['user', 'storage', 'source', 'contentType']
    }], done);
  };

  var compileConditions = (done) => {
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

  var setupLog = (done) => {
    log = logger.scopedLog(conditions);
    done();
  };

  var persistItemDataObject = (done) => {
    Item.findOrCreate(conditions, function(error, item) {
      if (error) {
        done(error);
      } else {
        done(undefined, item);
      }
    });
  };

  var saveSourceCreatedAt = (item, done) => {
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

  var saveDescription = (item, done) => {
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

  var determinePath = (item, done) => {
    storagePath(item, itemDataObject, function(error, path) {
      done(error, path, item);
    });
  };

  var savePath = (path, item, done) => {
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
      debug.success('persistItemDataObject');
    }

    done(error, item);
  });
};
