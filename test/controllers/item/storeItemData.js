var db = require('../../db');
var assert = require('assert');
var async = require('async');
var sinon = require('sinon');
var wh = require('../../warehouse');
var nock = require('../../nock');
var app = require('../../../app');
var UserStorageAuthFactory = require('../../factory')('userStorageAuth');
var UserFactory = require('../../factory')('user');
var ItemFactory = require('../../factory')('item');
var ContentType = require('../../../models/contentType');
var itCallbacksError = require('../../method/itCallbacksError');
var itCallbacksNoError = require('../../method/itCallbacksNoError');
var controller = require('../../../controllers/item');
require('../../../lib/prototypes/object');

var resetAppSpy = require('./routines/resetAppSpy')(app);

describe('itemController.storeItemData method', function() {
  beforeEach(db.clear);
  beforeEach(resetAppSpy);

  itCallbacksError(controller.storeItemData, [{
    when: 'no item parameter provided',
    params: [undefined, app],
    error: 'Parameter item undefined or null'
  }, {
    when: 'item parameter has no userId property',
    params: [wh.item, app],
    error: 'Parameter item has no userId property',
    before: function(test, done) {
      var attributes = Object.clone(wh.swh.item.attributes);
      delete attributes.userId;
      test.params[0] = attributes;
      done();
    }
  }, {
    when: 'item parameter has no storageId property',
    params: [wh.item, app],
    error: 'Parameter item has no storageId property',
    before: function(test, done) {
      var attributes = Object.clone(wh.swh.item.attributes);
      delete attributes.storageId;
      test.params[0] = attributes;
      done();
    }
  }, {
    when: 'item parameter has no data property',
    params: [wh.item, app],
    error: 'Parameter item has no data property',
    before: function(test, done) {
      var attributes = Object.clone(wh.swh.item.attributes);
      delete attributes.data;
      test.params[0] = attributes;
      done();
    }
  }, {
    when: 'item parameter has no save property',
    params: [wh.item, app],
    error: 'Parameter item has no save property',
    before: function(test, done) {
      var attributes = Object.clone(wh.swh.item.attributes);
      test.params[0] = attributes;
      done();
    }
  }]);

  itCallbacksNoError(controller.storeItemData, [{
    context: controller,
    when: 'provided item with json data and app',
    params: [wh.item, app],
    before: function(test, done) {
      var saveUser = function(done) {
        wh.user.save(function(error) {
          done(error);
        });
      };

      var createItem = function(done) {
        var attributes = Object.clone(wh.swh.item.attributes);
        attributes.userId = wh.user.id;
        attributes.storageId = wh.storage.id;

        ItemFactory.create(function(error, item) {
          test.params[0] = test.item = item;
          done(error, item);
        }, attributes);
      };

      var createUserStorageAuth = function(item, done) {
        UserStorageAuthFactory.create(done, {
          userId: wh.user.id,
          storageId: wh.storage.id
        });
      };

      var setupNock = function(userStorageAuth, done) {
        nock.putStorage(wh.storage, wh.userStorageAuth);
        done();
      };

      async.waterfall([
        saveUser,
        createItem, 
        createUserStorageAuth,
        setupNock
      ], done);
    },
    after: function(test, done) {
      var contentType = new ContentType({ id: test.item.contentTypeId });

      try {
        assert(test.item.storageVerifiedAt);
        assert.equal(test.item.storageBytes, wh.bytes);
        assert(app.emit.firstCall.calledWith('storedItemData', test.item));

        done();
      } catch (error) {
        done(error);
      }
    }
  }]);
});