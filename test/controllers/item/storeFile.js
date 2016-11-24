var db = require('../../db');
var wh = require('../../warehouse');
var nock = require('../../nock');
var UserStorageAuthFactory = require('../../factory')('userStorageAuth');
var itThrowsError = require('../../method/itThrowsError');
var itCallbacksError = require('../../method/itCallbacksError');
var itCallbacksResult = require('../../method/itCallbacksResult');
var method = require('../../../controllers/item').storeFile;

describe('itemController.storeFile method', function() {
  beforeEach(db.clear);
  beforeEach(nock.cleanAll);
  
  itCallbacksError(method, [{
    when: 'no user parameter provided',
    params: [undefined, wh.storage, wh.jsonPath, wh.jsonData],
    error: 'Parameter user undefined or null'
  }, {
    when: 'user parameter has no id property',
    params: [{ foo: 'bar' }, wh.storage, wh.jsonPath, wh.jsonData],
    error: 'Parameter user has no id property'
  }, {
    when: 'no storage parameter provided',
    params: [wh.user, undefined, wh.jsonPath, wh.jsonData],
    error: 'Parameter storage undefined or null'
  }, {
    when: 'storage parameter has no id property',
    params: [wh.user, { foo: 'bar' }, wh.jsonPath, wh.jsonData],
    error: 'Parameter storage has no id property'
  }, {
    when: 'storage parameter has no host property',
    params: [wh.user, { id: 'bar' }, wh.jsonPath, wh.jsonData],
    error: 'Parameter storage has no host property'
  }, {
    when: 'storage parameter has no itemUrl property',
    params: [wh.user, { id: 'bar', host: 'weee' }, wh.jsonPath, wh.jsonData],
    error: 'Parameter storage has no itemUrl property'
  }, {
    when: 'itemUrl property of storage parameter not function',
    params: [wh.user, { id: 'bar', host: 'weee', itemUrl: 3 }, wh.jsonPath, wh.jsonData],
    error: 'Property itemUrl of parameter storage is not function'
  }, {
    when: 'no path parameter provided',
    params: [wh.user, wh.storage, undefined, wh.jsonData],
    error: 'Parameter path undefined or null'
  }, {
    when: 'path parameter not string',
    params: [wh.user, wh.storage, 3, wh.jsonData],
    error: 'Parameter path is not a string'
  }, {
    when: 'path parameter lacks leading slash',
    params: [wh.user, wh.storage, 'foo.bar', wh.jsonData],
    error: 'Parameter path is not a properly formatted string'
  }, {
    when: 'path parameter contains several periods',
    params: [wh.user, wh.storage, '/h.el.lo', wh.jsonData],
    error: 'Parameter path is not a properly formatted string'
  }, {
    when: 'path parameter contains period at end but lacks extension',
    params: [wh.user, wh.storage, '/hello.', wh.jsonData],
    error: 'Parameter path is not a properly formatted string'
  }, {
    when: 'path parameter lacks extension',
    params: [wh.user, wh.storage, '/hello', wh.jsonData],
    error: 'Parameter path is not a properly formatted string'
  }, {
    when: 'path parameter lacks supported extension',
    params: [wh.user, wh.storage, '/hello', wh.jsonData],
    error: 'Parameter path is not a properly formatted string'
  }, {
    when: 'no data parameter provided',
    params: [wh.user, wh.storage, wh.jsonPath, undefined],
    error: 'Parameter data undefined or null'
  }, {
    when: 'data parameter not object or buffer',
    params: [wh.user, wh.storage, wh.jsonPath, 3],
    error: 'Parameter data is not one of the supported types: buffer, object'
  }, {
    when: 'jpg path matched with json data',
    params: [wh.user, wh.storage, wh.jpegPath, wh.jsonData],
    error: 'Path parameter with jpg extension not provided with binary data'
  }, {
    when: 'json path matched with buffer data',
    params: [wh.user, wh.storage, wh.jsonPath, wh.jpegData],
    error: 'Path parameter with json extension not provided with parseable data'
  }, {
    when: 'userStorageAuth.storageToken invalid',
    params: [wh.user, wh.storage, wh.jsonPath, wh.jsonData],
    error: 'Failed to make authorized request',
    before: function(test, done) {
      UserStorageAuthFactory.create(function(error, userStorageAuth) {
        nock.putStorage(test.params[1], userStorageAuth, 401);
        done();
      }, {
        userId: test.params[0].id,
        storageId: test.params[1].id,
        storageToken: wh.userStorageAuth.storageToken
      });
    }
  }]);

  itCallbacksResult(method, [{
    when: 'provided JSON data',
    params: [wh.user, wh.storage, wh.jsonPath, wh.jsonData],
    expectedResult: { bytes: wh.bytes },
    before: function(test, done) {
      nock.putStorage(test.params[1], wh.userStorageAuth);

      UserStorageAuthFactory.create(done, {
        userId: test.params[0].id,
        storageId: test.params[1].id
      });
    }
  }, {
    when: 'provided buffer data',
    params: [wh.user, wh.storage, wh.jpegPath, wh.jpegData],
    expectedResult: { bytes: wh.bytes },
    before: function(test, done) {
      nock.putStorage(test.params[1], wh.userStorageAuth);

      UserStorageAuthFactory.create(done, {
        userId: test.params[0].id,
        storageId: test.params[1].id
      });
    }
  }]);
});