/**
 * ContentType model
 * @module
 */

var jsonapi = require('app/lib/jsonapi'),
  modelFactory = require('app/factories/model'),
  mongoose = require('app/lib/mongoose'),
  nameMethods = require('app/models/methods/name');

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
    patch: jsonapi.adminFlag,
    post: jsonapi.adminFlag
  }
}, nameMethods);
