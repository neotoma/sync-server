var _ = require('lodash'),
  debug = require('app/lib/debug')('app:itemController'),
  validateParams = require('app/lib/validateParams');

/**
 * Return array of item data objects from within page object from source for contentType
 * @param {module:controllers/item~Page} page
 * @param {Source} source
 * @param {ContentType} contentType
 * @returns {Object[]} ItemDataObjects
 */
module.exports = function(page, source, contentType) {
  validateParams([{
    name: 'page', variable: page, required: true, requiredType: 'object'
  }, {
    name: 'source', variable: source, required: true, requiredProperties: ['itemDataObjectsFromPagePathTemplate']
  }]);

  var path = source.itemDataObjectsFromPagePath(contentType);

  debug.trace('itemDataObjectsFromPage path: %s', path);

  var itemDataObjects = path ? _.get(page, path, []) : page;

  debug.trace('itemDataObjectsFromPage total: %s', itemDataObjects.length);

  return itemDataObjects;
};
