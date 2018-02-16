/**
 * Widget model
 * @module
 */

var modelFactory = require('app/factories/model');

/**
 * Represents a widget
 * @class User
 * @property {string} color - Color of widget
 */
module.exports = modelFactory.new('Widget', {
  color: { type: String, required: true }
}, {
  jsonapi: {
    get: 'public',
    post: 'public'
  }
});
