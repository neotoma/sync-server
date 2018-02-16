var async = require('async'),
  storageId = require('app/controllers/item/storageId'),
  validateParams = require('app/lib/validateParams');

/**
 * Callbacks file system path used to store item on storage.
 * @param {Item} item - Item.
 * @param {Object} data - Raw item data from source.
 * @param {function} done - Error-first callback function expecting file system path as second parameter.
 */
module.exports = function(item, data, done) {
  var validate = (done) => {
    validateParams([{
      name: 'item', variable: item, required: true, requiredProperties: ['id', 'contentType']
    }], done);
  };

  var getStorageId = (done) => {
    storageId(item, data, done);
  };

  var storagePath = (id, done) => {
    done(undefined, `/${item.contentType.pluralLowercaseName()}/${id}.json`);
  };

  async.waterfall([validate, getStorageId, storagePath], done);
};
