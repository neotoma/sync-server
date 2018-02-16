/**
 * Assert result value
 * @module
 */

var _ = require('underscore');
var assert = require('assert');

/**
 * Assert that result matches that of test.
 * @param {test} test - Test parameters including result property, which can be assertion, object or primitive.
 * @param {*} - Result from running test.
 * @param {callback} done
 */
module.exports = function(test, result, done) {
  if (typeof test.result === 'function') {
    test.result(result, done);
  } else if (typeof test.result === 'object') {
    try {
      assert(_.isEqual(result, test.result));
      done();
    } catch (error) {
      done(new Error(`Object returned does match value expected:\n\n${JSON.stringify(result)}\n\n!==\n\n${JSON.stringify(test.result)}`));
    }
  } else {
    assert.deepEqual(result, test.result);
    done();
  }
};
