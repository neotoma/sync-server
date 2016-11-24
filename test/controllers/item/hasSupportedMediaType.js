var db = require('../../db');
var itThrowsError = require('../../method/itThrowsError');
var itReturnsResult = require('../../method/itReturnsResult');
var controller = require('../../../controllers/item');
var method = controller.hasSupportedMediaType;

describe('itemController.hasSupportedMediaType method', function() {
  itThrowsError(method, [{
    when: 'no url parameter provided',
    params: [undefined],
    error: 'Parameter url undefined or null'
  }, {
    when: 'url is not string',
    params: [3],
    error: 'Parameter url is not a string'
  }]);

  itReturnsResult(method, [{
    when: 'url with jpeg extension provided',
    params: ['http://example.com/image.jpeg'],
    expectedResult: true
  }, {
    when: 'url with jpg extension provided',
    params: ['http://example.com/image.jpg'],
    expectedResult: true
  }, {
    when: 'url with json extension provided',
    params: ['http://example.com/data.json'],
    expectedResult: true
  }, {
    when: 'url with txt extension provided',
    params: ['http://example.com/data.txt'],
    expectedResult: false
  }, {
    when: 'url with no extension provided',
    params: ['http://example.com/data'],
    expectedResult: undefined
  }]);
});