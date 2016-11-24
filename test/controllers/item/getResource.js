var db = require('../../db');
var wh = require('../../warehouse');
var nock = require('../../nock');
var itCallbacksError = require('../../method/itCallbacksError');
var itCallbacksResult = require('../../method/itCallbacksResult');
var method = require('../../../controllers/item').getResource;

describe('itemController.getResource method', function() {
  beforeEach(db.clear);

  itCallbacksError(method, [{
    when: 'no url parameter provided',
    params: [undefined],
    error: 'Parameter url undefined or null',
  }, {
    when: 'url parameter not string',
    params: [3],
    error: 'Parameter url is not a string',
  }, {
    when: 'url parameter not a valid URL',
    params: ['asdf'],
    error: 'Parameter url is not a properly formatted string',
  }, {
    when: 'url parameter has unsupported extension',
    params: ['http://example.com/foo.xyz'],
    error: 'Parameter url indicates unsupported media type',
  }, {
    when: 'url parameter indicates non-existent resource',
    params: [wh.jsonUrl],
    error: 'Failed to make successful request',
    before: function(test, done) {
      nock.get(wh.jsonUrl, wh.jsonData, 404);
      done();
    }
  }, {
    when: 'provided url without authorization',
    params: [wh.jsonUrl],
    error: 'Failed to make authorized request',
    before: function(test, done) {
      nock.get(wh.jsonUrl, wh.jsonData, 401);
      done();
    }
  }]);

  itCallbacksResult(method, [{
    when: 'provided valid url for json file and callback',
    params: [wh.jsonUrl],
    expectedResult: wh.jsonData,
    before: function(test, done) {
      nock.get(wh.jsonUrl,  wh.jsonData);
      done();
    }
  }, {
    when: 'provided valid url for jpeg file and callback',
    params: [wh.jpegUrl],
    expectedResult: wh.jpegData,
    before: function(test, done) {
      nock.get(wh.jpegUrl, wh.jpegData);
      done();
    }
  }]);
});