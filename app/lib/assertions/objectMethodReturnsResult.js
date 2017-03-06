/**
 * Assert returned value of object method
 * @module
 */

var _ = require('underscore');
var assert = require('assert');

module.exports = function(objectName, object, methodName, methodReturnValue) {
  it(objectName + ' object method ' + methodName + ' returns ' + typeof methodReturnValue + ' result', (done) => {
    if (typeof methodReturnValue === 'object') {
      assert(_.isEqual(object[methodName](), propertyValue));
    } else {
      assert.deepEqual(object[methodName](), methodReturnValue);
    }
    
    done();
  });
};