var assert = require('assert');

module.exports = require('./it')('callbacks result when', function(test, done) {
  test.params.push(function(error, result) {
    try {
      if (test.result) {
        assert.deepEqual(result, test.result);
      }
      
      done();
    } catch (error) {
      done(error);
    }
  });

  test.method.apply(undefined, test.params);
});