require('park-ranger')();

var app = require('app'),
  assert = require('assert'),
  assertFunctionCallbacksError = require('app/lib/assertions/functionCallbacksError'),
  assertFunctionCallbacksNoError = require('app/lib/assertions/functionCallbacksNoError'),
  async = require('async'),
  mongoose = require('app/lib/mongoose'),
  nock = require('app/lib/nock'),
  resetAppSpy = require('./routines/resetAppSpy'),
  storeItemData = require('app/controllers/item/storeItemData'),
  wh = require('app/lib/warehouse');

describe('itemController storeItemData method', function() {
  beforeEach(mongoose.removeAllCollections);
  beforeEach(resetAppSpy);

  assertFunctionCallbacksError(storeItemData, [{
    when: 'no item parameter provided',
    params: [undefined, wh.jsonData(), wh.one('job')],
    error: 'Parameter item undefined or null'
  }, {
    when: 'no data parameter provided',
    params: [wh.one('item'), undefined, wh.one('job')],
    error: 'Parameter data undefined or null'
  }, {
    when: 'item parameter has no user property',
    params: [wh.one('item'), wh.jsonData(), wh.one('job')],
    error: 'Parameter item has no user property',
    before: function(done) {
      this.params[0] = wh.one('item', {
        user: undefined
      });

      done();
    }
  }, {
    when: 'item parameter has no storage property',
    params: [wh.one('item'), wh.jsonData(), wh.one('job')],
    error: 'Parameter item has no storage property',
    before: function(done) {
      this.params[0] = wh.one('item', {
        storage: undefined
      });

      done();
    }
  }, {
    when: 'item parameter has no save property',
    params: [wh.one('item'), wh.jsonData(), wh.one('job')],
    error: 'Parameter item has no save property',
    before: function(done) {
      this.params[0] = wh.mockProperties('item');
      done();
    }
  }]);

  assertFunctionCallbacksNoError(storeItemData, [{
    when: 'provided item with json data',
    params: [wh.one('item'), wh.jsonData(), wh.one('job')],
    before: function(done) {
      var storage, userStorageAuth;

      var saveContentType = (done) => {
        wh.oneSaved('contentType', {
          _id: this.params[0].contentType
        }, done);
      };

      var saveSource = (done) => {
        wh.oneSaved('source', {
          _id: this.params[0].source
        }, done);
      };

      var saveStorage = (done) => {
        wh.oneSaved('storage', {
          _id: this.params[0].storage
        }, (error, savedStorage) => {
          storage = savedStorage;
          done(error);
        });
      };

      var saveUser = (done) => {
        wh.oneSaved('user', {
          _id: this.params[0].user
        }, done);
      };

      var saveItem = (done) => {
        this.params[0].save(done);
      };

      var saveUserStorageAuth = (done) => {
        wh.oneSaved('userStorageAuth', {
          user: this.params[0].user,
          storage: this.params[0].storage
        }, (error, savedUserStorageAuth) => {
          userStorageAuth = savedUserStorageAuth;
          done(error);
        });
      };

      var populateItem = (done) => {
        this.params[0].populate('contentType source storage user', done);
      };

      var setupNock = (done) => {
        nock.postStorage(storage, userStorageAuth);
        done();
      };

      async.series([
        saveContentType,
        saveSource,
        saveStorage,
        saveUser,
        saveItem,
        saveUserStorageAuth,
        populateItem,
        setupNock
      ], done);
    },
    after: function(done) {
      try {
        assert(this.params[0].storageVerifiedAt);
        assert.equal(this.params[0].storageBytes, wh.bytes);
        assert.equal(this.params[0].storagePath, wh.jsonPath);
        assert(app.emit.firstCall.calledWith('storedItemData', this.params[0]));

        done();
      } catch (error) {
        done(error);
      }
    }
  }]);
});
