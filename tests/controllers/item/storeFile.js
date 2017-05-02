require('park-ranger')();
var assertions = require('app/lib/assertions');
var controller = require('app/controllers/item');
var mongoose = require('app/lib/mongoose');
var nock = require('app/lib/nock');
var wh = require('app/lib/warehouse');

var before = function(path) {
  return function(done) {
    wh.oneSaved('userStorageAuth', {
      user: this.params[0],
      storage: this.params[1]
    }, (error, userStorageAuth) => {
      nock.postStorage(this.params[1], userStorageAuth, 200, path);
      done();
    });
  };
};

describe('itemController.storeFile method', function() {
  beforeEach(mongoose.removeAllCollections);
  beforeEach(nock.cleanAll);
  
  assertions.function.callbacks.error(controller.storeFile, [{
    when: 'no user parameter provided',
    params: [undefined, wh.one('storage'), wh.jsonPath, wh.jsonData()],
    error: 'Parameter user undefined or null'
  }, {
    when: 'user parameter has no id property',
    params: [{ foo: 'bar' }, wh.one('storage'), wh.jsonPath, wh.jsonData()],
    error: 'Parameter user has no id property'
  }, {
    when: 'no storage parameter provided',
    params: [wh.one('user'), undefined, wh.jsonPath, wh.jsonData()],
    error: 'Parameter storage undefined or null'
  }, {
    when: 'storage parameter has no id property',
    params: [wh.one('user'), { foo: 'bar' }, wh.jsonPath, wh.jsonData()],
    error: 'Parameter storage has no id property'
  }, {
    when: 'storage parameter has no host property',
    params: [wh.one('user'), { id: 'bar' }, wh.jsonPath, wh.jsonData()],
    error: 'Parameter storage has no host property'
  }, {
    when: 'no path parameter provided',
    params: [wh.one('user'), wh.one('storage'), undefined, wh.jsonData()],
    error: 'Parameter path undefined or null'
  }, {
    when: 'path parameter not string',
    params: [wh.one('user'), wh.one('storage'), 3, wh.jsonData()],
    error: 'Parameter path is not a string'
  }, {
    when: 'path parameter lacks supported extension',
    params: [wh.one('user'), wh.one('storage'), '/hello.bar', wh.jsonData()],
    error: 'Parameter path extension indicates unsupported media type'
  }, {
    when: 'no data parameter provided',
    params: [wh.one('user'), wh.one('storage'), wh.jsonPath, undefined],
    error: 'Parameter data undefined or null'
  }, {
    when: 'data parameter not object or buffer',
    params: [wh.one('user'), wh.one('storage'), wh.jsonPath, 3],
    error: 'Parameter data is not one of the supported types: buffer, object'
  }, {
    when: 'jpg path matched with json data',
    params: [wh.one('user'), wh.one('storage'), wh.jpegPath, wh.jsonData()],
    error: 'Path parameter with jpg extension not provided with binary data'
  }, {
    when: 'json path matched with buffer data',
    params: [wh.one('user'), wh.one('storage'), wh.jsonPath, wh.jpegData],
    error: 'Path parameter with json extension not provided with parseable data'
  }, {
    when: 'userStorageAuth.storageToken invalid',
    params: [wh.one('user'), wh.one('storage'), wh.jsonPath, wh.jsonData()],
    error: 'Failed to make successful request. HTTP status code: 401',
    before: function(done) {
      wh.oneSaved('userStorageAuth', {
        user: this.params[0],
        storage: this.params[1]
      }, (error, userStorageAuth) => {
        nock.postStorage(this.params[1], userStorageAuth, 401);
        done();
      });
    }
  }]);

  assertions.function.callbacks.result(controller.storeFile, [{
    when: 'provided JSON data',
    params: [wh.one('user'), wh.one('storage'), wh.jsonPath, wh.jsonData()],
    result: { size: wh.bytes, path_lower: wh.jsonPath },
    before: before(wh.jsonPath)
  }, {
    when: 'provided buffer data',
    params: [wh.one('user'), wh.one('storage'), wh.jpegPath, wh.jpegData],
    result: { size: wh.bytes, path_lower: wh.jpegPath },
    before: before(wh.jpegPath)
  }]);
});