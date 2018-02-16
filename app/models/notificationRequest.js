/**
 * NotificationRequest model
 * @module
 */

var modelFactory = require('app/factories/model');
var queryConditions = require('./queryConditions');

/**
 * Represents request for notification by user upon occurence of event
 * @class NotificationRequest
 * @property {module:models/contactVerificationRequest~ContactVerificationRequest} contactVerificationRequest - ContactVerificationRequest that created notificationRequest
 * @property {string} event - Event of which to notify user
 * @property {module:models/source~Source} [source] - Source related to event
 * @property {module:models/storage~Storage} [storage] - Storage related to event
 * @property {module:models/user~User} user - User to notify related to event
 */
module.exports = modelFactory.new('NotificationRequest', {
  contactVerificationRequest: { ref: 'ContactVerificationRequest' },
  event: { type: String, required: true },
  source: { ref: 'Source' },
  storage: { ref: 'Storage' },
  user: { ref: 'User' }
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
