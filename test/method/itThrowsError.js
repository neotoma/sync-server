var assert = require('assert');

module.exports = require('./it')('throws error when', function(test, done) {
  try {
    test.method.apply(undefined, test.params);
    done(new Error('Error not thrown by method'));
  } catch (error) {
    assert.equal(error.message, test.error);
    done();
  }
});