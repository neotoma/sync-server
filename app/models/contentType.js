/**
 * ContentType model
 * @module
 */

var modelFactory = require('app/factories/model');
var mongoose = require('app/lib/mongoose');
var nameMethods = require('app/models/methods/name');

/**
 * Represents type of content available from source for storage
 * @class ContentType
 * @property {string} name - Name of contentType (e.g. "Photo")
 */
module.exports = modelFactory.new('ContentType', {
  name: { type: String, required: true },
  dataTemplate: { type: mongoose.Schema.Types.Mixed }
}, {
  jsonapi: {
    get: 'public',
    patch: 'admin',
    post: 'admin'
  }
}, nameMethods);
