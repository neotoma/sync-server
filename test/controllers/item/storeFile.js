var db = require('../../db');
var wh = require('../../warehouse');
var nock = require('../../../lib/nock');
var UserStorageAuthFactory = require('../../factory')('userStorageAuth');
var itThrowsError = require('../../method/itThrowsError');
var itCallbacksError = require('../../method/itCallbacksError');
var itCallbacksNoError = require('../../method/itCallbacksNoError');
var method = require('../../../controllers/item').storeFile;

describe('item controller storeFile method', function() {
  beforeEach(db.clear);
  beforeEach(nock.cleanAll);
  
  itThrowsError(method, [{
    when: 'no user parameter provided',
    params: [undefined, wh.storage, wh.jsonPath, wh.jsonData, wh.emptyDone],
    error: 'Parameter user undefined or null'
  }, {
    when: 'user parameter has no id property',
    params: [{ foo: 'bar' }, wh.storage, wh.jsonPath, wh.jsonData, wh.emptyDone],
    error: 'Parameter user has no id property'
  }, {
    when: 'no storage parameter provided',
    params: [wh.user, undefined, wh.jsonPath, wh.jsonData, wh.emptyDone],
    error: 'Parameter storage undefined or null'
  }, {
    when: 'storage parameter has no id property',
    params: [wh.user, { foo: 'bar' }, wh.jsonPath, wh.jsonData, wh.emptyDone],
    error: 'Parameter storage has no id property'
  }, {
    when: 'storage parameter has no host property',
    params: [wh.user, { id: 'bar' }, wh.jsonPath, wh.jsonData, wh.emptyDone],
    error: 'Parameter storage has no host property'
  }, {
    when: 'storage parameter has no path property',
    params: [wh.user, { id: 'bar', host: 'weee' }, wh.jsonPath, wh.jsonData, wh.emptyDone],
    error: 'Parameter storage has no path property'
  }, {
    when: 'path property of storage parameter not function',
    params: [wh.user, { id: 'bar', host: 'weee', path: 3 }, wh.jsonPath, wh.jsonData, wh.emptyDone],
    error: 'Property path of storage not a function'
  }, {
    when: 'no path parameter provided',
    params: [wh.user, wh.storage, undefined, wh.jsonData, wh.emptyDone],
    error: 'Parameter path undefined or null'
  }, {
    when: 'path parameter not string',
    params: [wh.user, wh.storage, 3, wh.jsonData, wh.emptyDone],
    error: 'Parameter path not a string'
  }, {
    when: 'path parameter contains several periods',
    params: [wh.user, wh.storage, 'h.el.lo', wh.jsonData, wh.emptyDone],
    error: 'Parameter path has more than one period'
  }, {
    when: 'path parameter contains period at end but lacks extension',
    params: [wh.user, wh.storage, 'hello.', wh.jsonData, wh.emptyDone],
    error: 'Parameter path lacks extension'
  }, {
    when: 'path parameter lacks extension',
    params: [wh.user, wh.storage, 'hello', wh.jsonData, wh.emptyDone],
    error: 'Parameter path lacks extension'
  }, {
    when: 'path parameter lacks supported extension',
    params: [wh.user, wh.storage, 'hello', wh.jsonData, wh.emptyDone],
    error: 'Parameter path lacks extension'
  }, {
    when: 'no data parameter provided',
    params: [wh.user, wh.storage, wh.jsonPath, undefined, wh.emptyDone],
    error: 'Parameter data undefined or null'
  }, {
    when: 'data parameter not object or buffer',
    params: [wh.user, wh.storage, wh.jsonPath, 3, wh.emptyDone],
    error: 'Parameter data not an object or buffer'
  }, {
    when: 'jpg path matched with json data',
    params: [wh.user, wh.storage, wh.jpegPath, wh.jsonData, wh.emptyDone],
    error: 'Parameter extension jpg not provided with binary data'
  }, {
    when: 'json path matched with buffer data',
    params: [wh.user, wh.storage, wh.jsonPath, wh.jpegData, wh.emptyDone],
    error: 'Parameter extension json not provided with parseable data'
  }, {
    when: 'done parameter not function',
    params: [wh.user, wh.storage, wh.jsonPath, wh.jsonData, 3],
    error: 'Parameter done not a function'
  }]);

  itCallbacksNoError(method, [{
    when: 'provided JSON data',
    params: [wh.user, wh.storage, wh.jsonPath, wh.jsonData],
    before: function(done) {
      nock.putStorage(wh.storage, wh.userStorageAuth);

      UserStorageAuthFactory.create(done, {
        userId: wh.user.id,
        storageId: wh.storage.id
      });
    }
  }, {
    when: 'provided buffer data',
    params: [wh.user, wh.storage, wh.jpegPath, wh.jpegData],
    before: function(done) {
      nock.putStorage(wh.storage, wh.userStorageAuth);

      UserStorageAuthFactory.create(done, {
        userId: wh.user.id,
        storageId: wh.storage.id
      });
    }
  }]);

  itCallbacksError(method, [{
    when: 'userStorageAuth.storageToken invalid',
    params: [wh.user, wh.storage, wh.jsonPath, wh.jsonData],
    error: 'Failed to store file because of unauthorized request to storage',
    before: function(done) {
      nock.putStorage(wh.storage, wh.userStorageAuth);

      wh.userStorageAuth.userId = wh.user.id;
      wh.userStorageAuth.storageId = wh.storage.id;
      wh.userStorageAuth.storageToken = 'xxxxxxxxx';
      wh.userStorageAuth.save(function(error) {
        done(error);
      });
    }
  }]);
});