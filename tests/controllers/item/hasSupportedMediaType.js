require('park-ranger')();

var assertFunctionReturnsResult = require('app/lib/assertions/functionReturnsResult'),
  assertFunctionThrowsError = require('app/lib/assertions/functionThrowsError'),
  hasSupportedMediaType = require('app/controllers/item/hasSupportedMediaType');

describe('itemController hasSupportedMediaType method', function() {
  assertFunctionThrowsError(hasSupportedMediaType, [{
    when: 'no url parameter provided',
    params: [undefined],
    error: 'Parameter url undefined or null'
  }, {
    when: 'url is not string',
    params: [3],
    error: 'Parameter url is not a string'
  }]);

  assertFunctionReturnsResult(hasSupportedMediaType, [{
    when: 'url with jpeg extension provided',
    params: ['http://example.com/image.jpeg'],
    result: true
  }, {
    when: 'url with jpg extension provided',
    params: ['http://example.com/image.jpg'],
    result: true
  }, {
    when: 'url with json extension provided',
    params: ['http://example.com/data.json'],
    result: true
  }, {
    when: 'url with txt extension provided',
    params: ['http://example.com/data.txt'],
    result: false
  }, {
    when: 'url with no extension provided',
    params: ['http://example.com/data'],
    result: undefined
  }]);
});
