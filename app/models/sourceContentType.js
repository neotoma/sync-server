/**
 * sourceContentType model
 * @module
 */

var modelFactory = require('app/factories/model');
var nameMethods = require('./methods/name');

/**
 * This model will related contentTypes to sources and when documents are created for it,
 * they will imply that items for the given contentType
 * can be imported from the source (e.g. "photos" can be imported from "Facebook").
 * @class sourceContentType
 * @property {module:models/source~Source} source - source for this sourceContentType
 * @property {module:models/contentType~ContentType} contentType for this sourceContentType
 */
module.exports = modelFactory.new('SourceContentType', {
  source: { ref: 'Source',required: true },
  contentType: { ref: 'ContentType',required: true },
  itemsGetUrlTemplate: { type: String, default: 'https://${sourceHost}/${contentTypePluralCamelName}?access_token=${sourceToken}&limit=${sourceItemsLimit}&offset=${offset}'}

}, {
  jsonapi: {
    get: 'public',
    post: 'public',
    del: 'public'
  }
}, nameMethods);