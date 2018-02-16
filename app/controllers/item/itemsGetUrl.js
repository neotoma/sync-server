var validateParams = require('app/lib/validateParams');

/**
 * Return URL for making a GET request for items from source.
 * @param {Object} source - Source from which to retrieve items.
 * @param {Object} contentType - ContentType of items.
 * @param {Object} userSourceAuth - UserSourceAuth used to make request.
 * @param {Object} pagination - Pagination used to make request.
 * @returns {string} URL for making a GET request
 */
module.exports = function(source, contentType, userSourceAuth, pagination) {
  validateParams([{
    name: 'source', variable: source, required: true, requiredProperties: ['host']
  }, {
    name: 'contentType', variable: contentType, required: true, requiredProperties: ['name']
  }, {
    name: 'userSourceAuth', variable: userSourceAuth, required: true, requiredProperties: ['sourceToken']
  }, {
    name: 'pagination', variable: pagination
  }]);

  return source.itemsGetUrl({
    accessToken: userSourceAuth.sourceToken,
    apiVersion: source.apiVersion,
    contentTypePluralCamelName: contentType.pluralCamelName(),
    contentTypePluralLowercaseName: contentType.pluralLowercaseName(),
    host: source.host,
    limit: source.itemsLimit,
    maxId: (typeof pagination !== 'undefined' && pagination.maxId) ? pagination.maxId : undefined,
    offset: (typeof pagination !== 'undefined' && pagination.offset) ? pagination.offset : 0,
    next: (typeof pagination !== 'undefined' && pagination.next) ? pagination.next : undefined,
    sourceName: source.name
  });  
};
