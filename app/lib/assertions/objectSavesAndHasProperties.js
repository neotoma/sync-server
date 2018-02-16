/**
 * Assert properties of object after save method called
 * @module
 */

var assert = require('assert');

module.exports = function(objectName, object, properties) {
  it(objectName + ' object saves and has properties ' + properties.join(', '), function(done) {
    object.save(function(error) {
      if (error) {
        return done(error);
      }

      properties.forEach((property) => {
        assert(object[property]);
      });

      done();
    });
  });
};
