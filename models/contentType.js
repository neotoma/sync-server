/**
 * ContentType model
 * @module
 */

var modelFactory = require('../factories/model');
var nameMethods = require('./methods/name');

/**
 * Represents type of content available from source for storage
 * @class ContentType
 * @property {string} name - Name of contentType (e.g. "Photo")
 */
module.exports = modelFactory.new('ContentType', {
  name: { type: String, required: true }
}, {
  jsonapi: {
    get: 'public',
    post: 'admin'
  }
}, nameMethods);