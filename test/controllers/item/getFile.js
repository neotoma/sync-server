var db = require('../../db');
var wh = require('../../warehouse');
var controller = require('../../../controllers/item');
var nock = require('../../../lib/nock');
var itThrowsError = require('../../method/itThrowsError');
var itCallbacksError = require('../../method/itCallbacksError');
var itCallbacksResult = require('../../method/itCallbacksResult');
var method = controller.getFile;

describe('item controller getFile method', function() {
  beforeEach(db.clear);

  itThrowsError(method, [{
    when: 'no url parameter provided',
    params: [undefined, wh.emptyDone],
    error: 'Parameter url undefined or null',
  }, {
    when: 'url parameter not string',
    params: [3, wh.emptyDone],
    error: 'Parameter url not a string',
  }, {
    when: 'url parameter has no extension',
    params: ['foo', wh.emptyDone],
    error: 'Parameter url has no extension',
  }, {
    when: 'url parameter has unsupported extension',
    params: ['foo.xyz', wh.emptyDone],
    error: 'Parameter url extension indicates unsupported MIME type',
  }, {
    when: 'no done parameter provided',
    params: [wh.jsonUrl, undefined],
    error: 'Parameter done undefined or null',
  }, {
    when: 'done parameter not function',
    params: [wh.jsonUrl, 3],
    error: 'Parameter done not a function',
  }]);

  itCallbacksError(method, [{
    when: 'provided invalid url',
    params: [wh.jsonUrl],
    error: 'Failed to get file',
    before: function(done) {
      nock.get(wh.jsonUrl, wh.jsonData, 404);
      done();
    }
  }, {
    when: 'provided url without authorization',
    params: [wh.jsonUrl],
    error: 'Failed to get file because of unauthorized request',
    before: function(done) {
      nock.get(wh.jsonUrl, wh.jsonData, 401);
      done();
    }
  }]);

  itCallbacksResult(method, [{
    when: 'provided valid url for json file and callback',
    params: [wh.jsonUrl],
    result: wh.jsonData,
    before: function(done) {
      nock.get(wh.jsonUrl,  wh.jsonData);
      done();
    }
  }, {
    when: 'provided valid url for jpeg file and callback',
    params: [wh.jpegUrl],
    result: wh.jpegData,
    before: function(done) {
      nock.get(wh.jpegUrl, wh.jpegData);
      done();
    }
  }]);
});