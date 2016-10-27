var assert = require('assert');

module.exports = require('./it')('callbacks error when', function(test, done) {
  test.params.push(function(error, result) {
    try {
      assert.equal(error, undefined);
      done();
    } catch (error) {
      done(error);
    }
  });

  test.method.apply(undefined, test.params);
});