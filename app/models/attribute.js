/**
 * Attribute model
 * @module
 */

var modelFactory = require('app/factories/model');

/**
 * Represents attribute of app
 * @class Attribute
 * @property {string} value - Value of attribute
 */
module.exports = modelFactory.new('Attribute', {
  _id: { type: String, required: true },
  value: { type: String, required: true }
}, {
  jsonapi: {
    get: 'public'
  }
});