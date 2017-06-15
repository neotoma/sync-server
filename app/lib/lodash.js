var _ = require('lodash');

/**
 * Returns given object with keys converted to camel case
 * @param {Object} object - Object
 * @return {Object} Object with camel case keys
 */
_.camelCasedKeys = function(object) {
  return _.mapKeys(object, (value, key) => {
    return _.camelCase(key);
  });
};

module.exports = _;