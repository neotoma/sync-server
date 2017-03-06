/**
 * Assert thrown error for function
 * @module
 */

var assert = require('assert');
var it = require('./it');

module.exports = it('throws error when', function(test, done) {
  try {
    test.subject.apply(test.context, test.params);
    done(new Error('Error not thrown by method'));
  } catch (error) {
    assert.equal(error.message, test.error);
    done();
  }
});