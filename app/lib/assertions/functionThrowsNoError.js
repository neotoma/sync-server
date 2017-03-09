/**
 * Assert no thrown error for function
 * @module
 */

var it = require('./it');

module.exports = it('throws no error when', function(test, done) {
  try {
    test.subject.apply(test.context, test.params);
    done();
  } catch (error) {
    done(error);
  }
});