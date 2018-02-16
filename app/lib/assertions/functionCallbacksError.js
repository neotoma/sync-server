/**
 * Asserts error for function callback
 * @module
 */

var assert = require('assert');
var it = require('./it');

module.exports = it('callbacks error', function(test, done) {
  test.params.push(function(error) {
    try {
      assert.equal(error.message, test.error);
      done();
    } catch (error) {
      done(error);
    }
  });

  test.subject.apply(test.context, test.params);
});
