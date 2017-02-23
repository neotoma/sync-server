require('../../../lib/env')('test');
var app = require('../../../app');
var assert = require('assert');
var async = require('async');
var assertions = require('../../../assertions');
var ContentType = require('../../../models/contentType');
var controller = require('../../../controllers/item');
var ItemFactory = require('../../factory')('item');
var mongoose = require('../../../lib/mongoose');
var nock = require('../../nock');
var resetAppSpy = require('./routines/resetAppSpy')(app);
var sinon = require('sinon');
var UserFactory = require('../../factory')('user');
var UserStorageAuthFactory = require('../../factory')('userStorageAuth');
var wh = require('../../../lib/warehouse');

describe('itemController.storeItemData method', function() {
  beforeEach(mongoose.removeCollections);
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
      var item = this.params[0];

      var contentType = wh.one('contentType', {
        _id: item.contentType
      });

      var source = wh.one('source', {
        _id: item.source
      });

      var storage = wh.one('storage', {
        _id: item.storage
      });

      var user = wh.one('user', {
        _id: item.user
      });

      var userStorageAuth = wh.one('userStorageAuth', {
        user: item.user,
        storage: item.storage
      });

      var populateItem = function(done) {
        item.populate('contentType source storage user', done);
      };

      var setupNock = function(done) {
        nock.postStorage(storage, userStorageAuth);
        done();
      };

      async.series([
        contentType.save,
        source.save,
        storage.save,
        user.save,
        item.save,
        userStorageAuth.save,
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