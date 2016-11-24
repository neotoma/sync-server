var assert = require('assert');

module.exports = require('./it')('returns result when', function(test, done) {
  test.result = test.method.apply(test.context, test.params);
  
  if (typeof test.expectedResult === 'function') {
    test.expectedResult(test, function(error) {
      done(error);
    })
  } else {
    assert.deepEqual(test.result, test.expectedResult);
    done();
  }
});