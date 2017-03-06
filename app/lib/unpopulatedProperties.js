/**
 * @module
 */

var ObjectId = require('mongoose').Types.ObjectId;

/**
 * Return given properties with all references unpopulated
 * @param {Object} properties
 */
module.exports = function(properties) {
  var unpopulatedProperties = {};

  Object.keys(properties).forEach((key) => {
    if (typeof properties[key] === 'object' && ObjectId.isValid(properties[key]._id)) {
      unpopulatedProperties[key] = properties[key]._id;
    } else {
      unpopulatedProperties[key] = properties[key];
    }
  });

  return unpopulatedProperties;
};