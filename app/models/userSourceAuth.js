/**
 * UserSourceAuth model
 * @module
 */

var modelFactory = require('app/factories/model');
var queryConditions = require('./queryConditions');

/**
 * Represents OAuth 2.0 credentials for user authentication to source
 * @class UserSourceAuth
 * @property {module:models/source~Source} source - Source at which to authenticate user
 * @property {string} [sourceToken] - OAuth 2.0 access token for source
 * @property {string} [sourceUser] - User identifier at source
 * @property {module:models/user~User} [user] - User to authenticate at source
 */
module.exports = modelFactory.new('UserSourceAuth', {
  source: { ref: 'Source', required: true },
  sourceToken: String,
  sourceUser: String,
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
    },
    filterProperties: ['sourceToken']
  }
});