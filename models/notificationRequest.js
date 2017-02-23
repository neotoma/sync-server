/**
 * NotificationRequest model
 * @module
 */

var modelFactory = require('../factories/model');
var queryConditions = require('./queryConditions');

/**
 * Represents request for notification by user upon occurence of event
 * @class NotificationRequest
 * @property {string} event - Event of which to notify user
 * @property {module:models/source~Source} [source] - Source related to event
 * @property {module:models/storage~Storage} [storage] - Storage related to event
 * @property {module:models/user~User} user - User to notify related to event
 */
module.exports = modelFactory.new('NotificationRequest', {
  event: { type: String, required: true },
  source: { ref: 'Source' },
  storage: { ref: 'Storage' },
  user: { ref: 'User', required: true }
}, {
  jsonapi: {
    get: {
      allowed: 'user',
      queryConditions: queryConditions.userMatchesRequester
    },
    post: {
      allowed: 'user',
      queryConditions: queryConditions.userMatchesRequester
    },
    delete: {
      allowed: 'user',
      queryConditions: queryConditions.userMatchesRequester
    }
  }
});