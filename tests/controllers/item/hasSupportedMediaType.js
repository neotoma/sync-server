require('dotenvs')('test');
var assertions = require('app/lib/assertions');
var controller = require('app/controllers/item');

describe('itemController.hasSupportedMediaType method', function() {
  assertions.function.throws.error(controller.hasSupportedMediaType, [{
    when: 'no url parameter provided',
    params: [undefined],
    error: 'Parameter url undefined or null'
  }, {
    when: 'url is not string',
    params: [3],
    error: 'Parameter url is not a string'
  }]);

  assertions.function.returnsResult(controller.hasSupportedMediaType, [{
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