/**
 * Status model
 * @module
 */

var modelFactory = require('app/factories/model');
var queryConditions = require('./queryConditions');

/**
 * Represents latest aggregate status of items storage for contentType, source and user
 * @class Status
 * @property {module:models/contentType~ContentType} contentType - ContentType represented by status
 * @property {module:models/item~Item} [item] - Last item copied to storage for contentType, source and storage
 * @property {module:models/source~Source} source - Source represented by status
 * @property {module:models/storage~Storage} storage - Storage represented by status
 * @property {module:models/user~User} user - User represented by status
 * @property {number} [totalItemsAvailable]- Total number of items last reported as available for contentType from source
 * @property {number} [totalItemsPending]- Total number of items last reported as pending storage for contentType from source
 * @property {number} [totalItemsStored]- Total number of items last reported as stored for contentType from source
 */
module.exports = modelFactory.new('Status', {
  contentType: { ref: 'ContentType', required: true },
  lastStoredItem: { ref: 'Item' },
  source: { ref: 'Source', required: true },
  storage: { ref: 'Storage', required: true },
  user: { ref: 'User', required: true },
  totalItemsAvailable: Number,
  totalItemsPending: Number,
  totalItemsStored: Number
}, {
  jsonapi: {
    get: {
      allowed: 'user',
      queryConditions: queryConditions.userMatchesRequester
    }
  }
});