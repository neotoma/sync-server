/**
 * Assert property of object
 * @module
 */

var _ = require('underscore');
var assert = require('assert');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function(objectName, object, propertyName, propertyValue) {
  var description = objectName + ' object has property ' + propertyName;

  if (propertyValue) {
    description += ' that matches ' + typeof propertyValue;
  }

  it(description, (done) => {
    if (typeof propertyValue === 'object') {
      try {
        if (typeof object[propertyName] === 'string' && ObjectId.isValid(object[propertyName])) {
          assert(_.isEqual(ObjectId(object[propertyName]), propertyValue));
        } else {
          assert(_.isEqual(object[propertyName], propertyValue));
        }
      } catch (error) {
        return done(new Error(`Object property "${propertyName}" does match value expected: ${JSON.stringify(object[propertyName])} !== ${propertyValue}`));
      }
    } else if (!propertyValue) {
      assert(typeof object[propertyName] !== 'undefined');
    } else {
      try {
        assert.deepEqual(object[propertyName], propertyValue);
      } catch (error) {
        return done(new Error(`Object property "${propertyName}" does match value expected: ${object[propertyName]} !== ${propertyValue}`));
      }
    }
    
    done();
  });
};
