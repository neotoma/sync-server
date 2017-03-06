/**
 * Asserts no error for function callback
 * @module
 */

var assert = require('assert');
var it = require('./it');

module.exports = it('callbacks no error', function(test, done) {
  test.params.push(function(testError) {
    try {
      assert.equal(testError, undefined);
      done();
    } catch (error) {
      done(testError);
    }
  });

  test.subject.apply(test.context, test.params);
});