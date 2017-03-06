/**
 * Assertions suite
 * @module
 */

module.exports = {
  function: {
    callbacks: {
      error: require('./functionCallbacksError'),
      noError: require('./functionCallbacksNoError'),
      result: require('./functionCallbacksResult')
    },
    returnsResult: require('./functionReturnsResult'),
    throws: {
      error: require('./functionThrowsError'),
      noError: require('./functionThrowsNoError')
    }
  },
  object: {
    hasProperty: require('./objectHasProperty'),
    hasProperties: require('./objectHasProperties'),
    method: {
      returnsResult: require('./objectMethodReturnsResult')
    },
    savesAndHasProperties: require('./objectSavesAndHasProperties'),
    toObjectMethodReturnsProperties: require('./objectToObjectMethodReturnsProperties')
  },
  route: require('./route')
};