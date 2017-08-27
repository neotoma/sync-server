/**
 * Assertion test framework
 * @module
 */

/**
 * Test
 * @typedef {Object} test
 * @property {routine} [after] - Routine to execute against test after run.
 * @property {routine} [before] - Routine to execute against test before run.
 * @property {function} [context] - Closure within which to run test as context
 * @property {string} error - Error message to expect from test run.
 * @property {Array} [params] - Params to apply against functional subject during test run.
 * @property {*} [result] - Result to expect from test run.
 * @property {(Object|function)} [subject] - Subject on which to apply test.
 * @property {string} [subjectName] - Name of subject on which to apply test.
 * @property {number} [timeout] - Total seconds to allow in execution of test before automatic timeout.
 * @property {string} [when] - Description of when the assertion applies.
 */

/**
 * Test assertion to apply during run.
 * @typedef {function} assertion
 * @param {test} test
 * @param {callback} done
 */

/**
 * Test routine
 * @typedef {function} routine
 * @param {test} test
 * @param {callback} done
 */

/**
 * Run tests against subject
 * @typedef {function} it
 * @param {string} subjectName - Name of subject on which to apply test
 * @param {(Object|function)} subject - Subject on which to apply test.
 * @param {test[]} tests - Tests to run against subject
 */

/**
 * Return function for applying assertion function against subject and tests.
 * @param {string} description - Description of assertion to run against subject (e.g. "returns result").
 * @param {assertion} assertion - Assertion function to run against subject with each test provided.
 * @returns {module:assertions/it~it}
 */
module.exports = function(description, assertion) {
  /**
   * Return description compiled with test data
   * @param {string} description - Base description
   * @param {test} test
   */
  var compiledDescription = function(description, test) {
    if (test.subjectName) {
      description = test.subjectName + ' ' + description;
    }

    if (test.when) {
      description += ' when ' + test.when;
    }

    return description;
  };

  return function(subjectName, subject, tests) {
    if (!tests) {
      tests = subject;
      subject = subjectName;
      subjectName = null;
    }

    tests.forEach(function(test) {
      test.subjectName = subjectName;
      test.subject = subject;

      if (!test.params) {
        test.params = [];
      }

      it(compiledDescription(description, test), function(done) {
        if (test.timeout) {
          this.timeout(test.timeout);
        }

        var after = done;

        if (test.after) {
          after = function(error) {
            if (error) {
              done(error);
            } else {
              test.after(done);
            }
          };
        }

        if (test.before) {
          test.before(function(error) {
            if (error) {
              done(error);
            } else {
              assertion(test, after);
            }
          });
        } else {
          assertion(test, after);
        }
      });
    });
  };
};