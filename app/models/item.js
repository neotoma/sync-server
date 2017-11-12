/**
 * Item model
 * @module
 */

var _ = require('lodash');
var emojiStrip = require('emoji-strip');
var modelFactory = require('app/factories/model');
var queryConditions = require('./queryConditions');
var sanitizeFilename = require('sanitize-filename');

/**
 * Represents atomic unit of content available from source for storage
 * @class Item
 * @property {module:models/contentType~ContentType} contentType - ContentType represented by item
 * @property {string} description - Description of item data
 * @property {module:models/source~Source} source - Source from which item was pulled
 * @property {string} sourceItem - Identifier for item at source
 * @property {module:models/storage~Storage} storage - Storage to which item data was copied
 * @property {Date} [storageAttemptedAt] - Date at which copy of item data to storage was last attempted
 * @property {number} [storageBytes] - Number of bytes used by copy of item data on storage
 * @property {Error} [storageError] - Error returned by storage after last attempt to copy item data
 * @property {Date} [storageFailedAt] - Date at which copy of item data to storage failed at last attempt
 * @property {module:models/user~User} user - User for which item was pulled from source
 */
module.exports = modelFactory.new('Item', {
  contentType: { ref: 'ContentType', required: true },
  description: String,
  source: { ref: 'Source', required: true },
  sourceCreatedAt: Date,
  sourceItem: { type: String, required: true },
  storage: { ref: 'Storage', required: true },
  storageAttemptedAt: Date,
  storageBytes: Number,
  storageError: String,
  storageFailedAt: Date,
  storagePath: String,
  storageVerifiedAt: Date,
  user: { ref: 'User', required: true }
}, {
  jsonapi: {
    sort: '-storageVerifiedAt',
    get: {
      allowed: 'user',
      queryConditions: queryConditions.userMatchesRequester
    }
  }
});