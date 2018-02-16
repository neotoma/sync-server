/**
 * Asserts result for function callback
 * @module
 */

var it = require('./it');
var assertResult = require('./result');

module.exports = it('callbacks result', function(test, done) {
  test.params.push((error, result) => {
    assertResult(test, result, done);
  });

  test.subject.apply(test.context, test.params);
});
