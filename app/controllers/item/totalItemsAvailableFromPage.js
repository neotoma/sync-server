var _ = require('lodash'),
  debug = require('app/lib/debug')('app:itemController'),
  validateParams = require('app/lib/validateParams');

/**
 * Returns total number of items available from page object returned by source.
 * Note: This is the total across all pages available from source, not just available within given page.
 * @param {Object} page - Page of items.
 * @param {source} source - Source of items page.
 * @param {Object} contentType - ContentType of items.
 * @returns {number} Total number of items available.
 */
module.exports = function(page, source, contentType) {
  validateParams([{
    name: 'page', variable: page, required: true, requiredType: 'object'
  }, {
    name: 'source', variable: source, required: true
  }]);

  var path = source.totalItemsAvailableFromPagePath(contentType);

  debug.trace('totalItemsAvailableFromPage path: %s', path);

  var total = path ? _.get(page, path) : page;

  debug.trace('totalItemsAvailableFromPage total: %s', total);

  return total;
};
