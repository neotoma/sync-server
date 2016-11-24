var assert = require('assert');
var db = require('../../db');
var wh = require('../../warehouse');
var itCallbacksError = require('../../method/itCallbacksError');
var itCallbacksNoError = require('../../method/itCallbacksNoError');
var controller = require('../../../controllers/item');
var nock = require('../../nock');
var method = controller.storeItemsPage;
var app = require('../../../app');

var resetAppSpy = require('./routines/resetAppSpy')(app);
var setupObjects = require('./routines/setupObjects');
var verifyStoredItems = require('./routines/verifyStoredItems');

describe('itemController.storeItemsPage method', function() {
  beforeEach(db.clear);
  beforeEach(resetAppSpy);
  
  itCallbacksError(method, [{
    when: 'no user parameter provided',
    params: [undefined, wh.source, wh.storage, wh.contentType, wh.pagination, app],
    error: 'Parameter user undefined or null'
  }, {
    when: 'user parameter has no id property',
    params: [3, wh.source, wh.storage, wh.contentType, wh.pagination, app],
    error: 'Parameter user has no id property'
  }, {
    when: 'no source parameter provided',
    params: [wh.user, undefined, wh.storage, wh.contentType, wh.pagination, app],
    error: 'Parameter source undefined or null'
  }, {
    when: 'source parameter has no id property',
    params: [wh.user, 3, wh.storage, wh.contentType, wh.pagination, app],
    error: 'Parameter source has no id property'
  }, {
    when: 'no storage parameter provided',
    params: [wh.user, wh.source, undefined, wh.contentType, wh.pagination, app],
    error: 'Parameter storage undefined or null'
  }, {
    when: 'storage parameter has no id property',
    params: [wh.user, wh.source, 3, wh.contentType, wh.pagination, app],
    error: 'Parameter storage has no id property'
  }, {
    when: 'no contentType parameter provided',
    params: [wh.user, wh.source, wh.storage, undefined, wh.pagination, app],
    error: 'Parameter contentType undefined or null'
  }, {
    when: 'contentType parameter has no id property',
    params: [wh.user, wh.source, wh.storage, 3, wh.pagination, app],
    error: 'Parameter contentType has no id property'
  }, {
    when: 'no pagination parameter provided',
    params: [wh.user, wh.source, wh.storage, wh.contentType, undefined, app],
    error: 'Parameter pagination undefined or null'
  }, {
    when: 'app has no emit method property',
    params: [wh.user, wh.source, wh.storage, wh.contentType, wh.pagination, 3],
    error: 'Parameter app has no emit property'
  }, {
    when: 'emit property of app is not function',
    params: [wh.user, wh.source, wh.storage, wh.contentType, wh.pagination, { emit: 3 }],
    error: 'Property emit of parameter app is not function'
  }]);

  itCallbacksNoError(method, [{
    context: controller,
    when: 'app parameter provided',
    params: [wh.user, wh.source, wh.storage, wh.contentType, wh.pagination, app],
    before: function(test, done) {
      setupObjects(test.params[0], test.params[1], test.params[2], test.params[3], function(error) {
        done(error);
      });
    },
    after: function(test, done) {
      verifyStoredItems(test.params[3], test.params[5], done);
    }
  }, {
    context: controller,
    when: 'no app parameter provided',
    params: [wh.user, wh.source, wh.storage, wh.contentType, wh.pagination, app],
    before: function(test, done) {
      setupObjects(test.params[0], test.params[1], test.params[2], test.params[3], done);
    },
    after: function(test, done) {
      verifyStoredItems(test.params[3], test.params[5], done);
    }
  }]);
});