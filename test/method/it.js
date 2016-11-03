var assert = require('assert');

module.exports = function(description, runTest) {
  return function(method, tests) {
    tests.forEach(function(test) {
      test.method = method;

      it(description + ' ' + test.when, function(done) {
        if (test.after) {
          var after = function(error) {
            if (error) {
              done(error);
            } else {
              test.after(test, done);
            }
          }
        } else {
          var after = done;
        }

        if (test.before) {
          test.before(test, function(error) {
            if (error) {
              return done(error);
            }

            runTest(test, after);
          });
        } else {
          runTest(test, after);
        }
      });
    });
  };
};