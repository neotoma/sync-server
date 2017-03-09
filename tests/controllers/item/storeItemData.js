require('dotenvs')('test');
var app = require('app');
var assert = require('assert');
var async = require('async');
var assertions = require('app/lib/assertions');
var ContentType = require('app/models/contentType');
var controller = require('app/controllers/item');
var ItemFactory = require('app/lib/factory')('item');
var mongoose = require('app/lib/mongoose');
var nock = require('app/lib/nock');
var resetAppSpy = require('./routines/resetAppSpy')(app);
var sinon = require('sinon');
var UserFactory = require('app/lib/factory')('user');
var UserStorageAuthFactory = require('app/lib/factory')('userStorageAuth');
var wh = require('app/lib/warehouse');

describe('itemController.storeItemData method', function() {
  beforeEach(mongoose.removeAllCollections);
  beforeEach(resetAppSpy);

  assertions.function.callbacks.error(controller.storeItemData, [{
    when: 'no item parameter provided',
    params: [undefined, wh.jsonData(), app],
    error: 'Parameter item undefined or null'
  }, {
    when: 'no data parameter provided',
    params: [wh.one('item'), undefined, app],
    error: 'Parameter data undefined or null'
  }, {
    when: 'item parameter has no user property',
    params: [wh.one('item'), wh.jsonData(), app],
    error: 'Parameter item has no user property',
    before: function(done) {
      this.params[0] = wh.one('item', {
        user: undefined
      });

      done();
    }
  }, {
    when: 'item parameter has no storage property',
    params: [wh.one('item'), wh.jsonData(), app],
    error: 'Parameter item has no storage property',
    before: function(done) {
      this.params[0] = wh.one('item', {
        storage: undefined
      });

      done();
    }
  }, {
    when: 'item parameter has no save property',
    params: [wh.one('item'), wh.jsonData(), app],
    error: 'Parameter item has no save property',
    before: function(done) {
      this.params[0] = wh.mockProperties('item');
      done();
    }
  }]);

  assertions.function.callbacks.noError(controller.storeItemData, [{
    context: controller,
    when: 'provided item with json data and app',
    params: [wh.one('item'), wh.jsonData(), app],
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