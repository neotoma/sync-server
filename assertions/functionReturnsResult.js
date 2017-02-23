/**
 * Assert return value for function
 * @module
 */

var it = require('./it');
var assertResult = require('./result');

module.exports = it('function returns result', function(test, done) {
  assertResult(test, test.subject.apply(test.context, test.params), done);
});