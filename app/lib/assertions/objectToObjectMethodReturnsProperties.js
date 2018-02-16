/**
 * Assert properties of object returned by object toObject method
 * @module
 */

var _ = require('underscore');
var assert = require('assert');
var debug = require('app/lib/debug')('app:objectToObjectMethodReturnsProperties');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function(objectName, object, properties) {
  it(objectName + ' object toObject method returns properties', (done) => {
    var returnedObject = object.toObject();

    for (var property in properties) {
      if (property === '_id') {
        if (ObjectId.isValid(returnedObject['id'])) {
          assert.deepEqual(ObjectId(returnedObject['id']), properties['_id']);
        } else {
          assert.deepEqual(returnedObject['id'], properties['_id']);
        }
      } else if (properties[property]) {
        try {
          debug('property', property);
          debug('returnedObject[property]', typeof returnedObject[property]);
          debug('properties[property]', typeof properties[property]);

          assert(_.isEqual(returnedObject[property], properties[property]));
        } catch (error) {
          return done(new Error(`Object property does match value expected: ${returnedObject[property]} !== ${properties[property]}`));
        }
      } else {
        // If property to verify is null, just check if it exists
        try {
          assert(typeof returnedObject[property] !== undefined);
        } catch (error) {
          return done(new Error('No property found for ' + property));
        }
      }
    }

    done();
  });
};
