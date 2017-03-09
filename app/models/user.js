/**
 * User model
 * @module
 */

var modelFactory = require('app/factories/model');
var queryConditions = require('./queryConditions');

/**
 * Represents individual person
 * @class User
 * @property {boolean} [admin=false] - Whether user is system administrator
 * @property {string} email - Email address of user
 * @property {string} [name] - Name of user
 */
module.exports = modelFactory.new('User', {
  admin: { type: Boolean, default: false },
  email: { type: String, required: true },
  name: String
}, {
  jsonapi: {
    get: {
      allowed: 'user',
      queryConditions: queryConditions.idMatchesRequester
    }
  }
});