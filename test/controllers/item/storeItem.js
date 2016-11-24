var db = require('../../db');
var assert = require('assert');
var async = require('async');
var sinon = require('sinon');
var wh = require('../../warehouse');
var nock = require('../../nock');
var app = require('../../../app');
var UserStorageAuthFactory = require('../../factory')('userStorageAuth');
var ItemFactory = require('../../factory')('item');
var ContentType = require('../../../models/contentType');
var itThrowsError = require('../../method/itThrowsError');
var itCallbacksNoError = require('../../method/itCallbacksNoError');
var app = require('../../../app');
var controller = require('../../../controllers/item');
require('../../../lib/prototypes/object');

describe('item controller', function() {
  beforeEach(db.clear);

  describe('storeItem method', function() {
    itThrowsError(controller.storeItemData, [{
      when: 'no app parameter provided',
      params: [undefined, wh.user, wh.storage, wh.source, wh.contentType, wh.item, wh.emptyDone],
      error: 'Parameter app undefined or null'
    }, {
      when: 'app parameter has no emit property',
      params: [3, wh.user, wh.storage, wh.source, wh.contentType, wh.item, wh.emptyDone],
      error: 'Parameter app has no emit property'
    }, {
      when: 'no item parameter provided',
      params: [app, wh.user, wh.storage, wh.source, wh.contentType, undefined, wh.emptyDone],
      error: 'Parameter item undefined or null'
    }, {
      when: 'item parameter has no id property',
      params: [app, wh.user, wh.storage, wh.source, wh.contentType, 3, wh.emptyDone],
      error: 'Parameter item has no id property'
    }, {
      when: 'item parameter has no userId property',
      params: [app, wh.user, wh.storage, wh.source, wh.contentType, 3, wh.emptyDone],
      error: 'Parameter item has no userId property',
      before: function(test, done) {
        ItemFactory.create(done, {
          userId: undefined
        });
      }
    }, {
      when: 'item parameter has no data property',
      params: [app, wh.user, wh.storage, wh.source, wh.contentType, { id: wh.swh.contentType.attributes.id }, wh.emptyDone],
      error: 'Parameter item has no data property'
    }, {
      when: 'item parameter has no save property',
      params: [app, wh.user, wh.storage, wh.source, wh.contentType, { id: 3, data: { foo: 'bar' } }, wh.emptyDone],
      error: 'Parameter item has no save property'
    }, {
      when: 'no done parameter provided',
      params: [app, wh.user, wh.storage, wh.source, wh.contentType, wh.item],
      error: 'Parameter done undefined or null'
    }, {
      when: 'done parameter not function',
      params: [app, wh.user, wh.storage, wh.source, wh.contentType, wh.item, 3],
      error: 'Parameter done is not a function'
    }]);

    itCallbacksNoError(controller.storeItemData, [{
      context: controller,
      when: 'provided adequate parameters',
      params: [app, wh.user, wh.storage, wh.source, wh.contentType],
      error: 'Parameter app undefined or null',
      before: function(test, done) {
        nock.putStorage(wh.storage, wh.userStorageAuth);
        sinon.spy(app, 'emit');

        var createItem = function(done) {
          ItemFactory.create(function(error, item) {
            test.params[5] = test.item = item;
            done();
          }, {
            bytes: undefined,
            path: undefined,
            storageVerifiedAt: undefined,
            contentTypeId: test.params[4].id
          });
        };

        var createUserStorageAuth = function(done) {
          UserStorageAuthFactory.create(done, {
            userId: wh.user.id,
            storageId: wh.storage.id
          });
        };

        async.parallel([createItem, createUserStorageAuth], function(error) {
          done(error);
        });
      },
      after: function(test, done) {
        var contentType = new ContentType({ id: test.item.contentTypeId });

        try {
          assert(test.item.storageVerifiedAt);
          assert.equal(test.item.bytes, wh.bytes);
          assert.equal(test.item.path, '/' + contentType.pluralId + '/' + test.item.id + '.json');
          assert(app.emit.firstCall.calledWith('itemSyncVerified', test.item));

          done();
        } catch (error) {
          done(error);
        }
      }
    }]);

    it('returns 200 status if provided valid parameters');
  });
});

// 'no app parameter provided'
// 'app parameter has no emit method'
// 'no user parameter provided'
// 'user parameter has no id property'
// 'no storage parameter provided'
// 'storage parameter has no id property'
// 'no contentType parameter provided'
// 'contentType parameter has no id property'
// 'contentType parameter has no pluralId method'
// 'no item parameter provided'
// 'item parameter not valid object'
// 'no done parameter provided'
// 'done parameter not a function'