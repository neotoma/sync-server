var _ = require('app/lib/lodash');

/**
 * Normalizes object of relationships from request
 * @param {Object} relationships - Request relationships
 * @return {Object} Normalized relationships
 */
module.exports = function(relationships) {
  relationships = Object.assign({}, relationships);

  // Remove any relationships with empty data properties
  for (var key in relationships) {
    if (!relationships[key].data) {
      delete relationships[key];
    }
  }

  // Convert names to camelCase
  relationships = _.mapKeys(relationships, (value, key) => {
    return _.camelCase(key);
  });

  return relationships;
};
