var assert = require('assert');

module.exports = function(description, runTest) {
  return function(method, tests) {
    tests.forEach(function(test) {
      test.method = method;

      it(description + ' ' + test.when, function(done) {
        if (test.before) {
          test.before(function(error) {
            if (error) {
              return done(error);
            }

            runTest(test, done);
          });
        } else {
          runTest(test, done);
        }
      });
    });
  };
};