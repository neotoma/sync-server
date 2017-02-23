/**
 * Assert properties of object
 * @module
 */

var objectHasProperty = require('./objectHasProperty');

module.exports = function(objectName, object, properties) {
  if (Array.isArray(properties)) {
    properties.forEach(function(propertyName) {
      objectHasProperty(objectName, object, propertyName);
    });
  } else if (typeof properties === 'object') {
    for (var propertyName in properties) {
      objectHasProperty(objectName, object, propertyName, properties[propertyName]);
    };
  } 
};