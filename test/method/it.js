var assert = require('assert');
var wh = require('../warehouse');
require('../../lib/prototypes/string');

module.exports = function(description, runTest) {
  return function(method, tests) {
    tests.forEach(function(test) {
      test.method = method;

      it(description + ' ' + test.when, function(done) {
        if (test.params.map) {
          test.params = test.params.map(function(param) {
            if (param && typeof param.save !== 'undefined') {
              return wh.swh[param.constructor.modelName.lowercaseFirstLetter()].one();
            } else {
              return param;
            }
          });
        };

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
              done(error);
            } else {
              runTest(test, after);
            }
          });
        } else {
          runTest(test, after);
        }
      });
    });
  };
};