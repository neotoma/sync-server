var assert = require('assert');

module.exports = require('./it')('callbacks result when', function(test, done) {
  test.params.push(function(error, result) {
    try {
      assert.equal(error, undefined);

      if (test.result) {
        if (typeof test.result === 'function') {
          test.result(result, function(error) {
            done(error);
          })
        } else {
          assert.deepEqual(result, test.result);
          done();
        }
      } else {
        done();
      }
    } catch (error) {
      done(error);
    }
  });

  test.method.apply(test.context, test.params);
});