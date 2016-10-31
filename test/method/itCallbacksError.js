var assert = require('assert');

module.exports = require('./it')('callbacks error when', function(test, done) {
  test.params.push(function(error) {
    try {
      assert.equal(error.message, test.error);
      done();
    } catch (error) {
      done(error);
    }
  });

  test.method.apply(test.context, test.params);
});