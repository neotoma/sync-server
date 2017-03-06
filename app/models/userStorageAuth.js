/**
 * UserStorageAuth model
 * @module
 */

var modelFactory = require('app/factories/model');
var queryConditions = require('./queryConditions');

/**
 * Represents OAuth 2.0 credentials for user authentication to storage
 * @class UserStorageAuth
 * @property {module:models/storage~Storage} storage - Storage at which to authenticate user
 * @property {string} [storageToken] - OAuth 2.0 access token for storage
 * @property {string} [storageUser] - User identifier at storage
 * @property {module:models/user~User} [user] - User to authenticate at storage
 */
module.exports = modelFactory.new('UserStorageAuth', {
  storage: { ref: 'Storage', required: true },
  storageToken: String,
  storageUser: String,
  user: { ref: 'User' }
}, {
  jsonapi: {
    get: {
      allowed: 'user',
      queryConditions: queryConditions.userMatchesRequester
    },
    delete: {
      allowed: 'user',
      queryConditions: queryConditions.userMatchesRequester
    }
  }
});