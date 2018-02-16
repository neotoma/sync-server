var async = require('async'),
  validateParams = require('app/lib/validateParams');

/**
 * Callbacks ID used to store item on storage.
 * @param {Item} item - Item.
 * @param {Object} data - Raw item data from source.
 * @param {function} done - Error-first callback function expecting ID as second parameter.
 */
module.exports = function(item, data, done) {
  var validate = function(done) {
    validateParams([{
      name: 'item', variable: item, required: true, requiredProperties: ['id', 'contentType']
    }], done);
  };

  var storageId = function(done) {
    done(undefined, `${item.source.lowercaseName()}-${data.id}`);
  };

  async.waterfall([validate, storageId], done);
};
