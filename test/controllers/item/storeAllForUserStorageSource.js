var db = require('../../db');
var wh = require('../../warehouse');
var itCallbacksError = require('../../method/itCallbacksError');
var itCallbacksNoError = require('../../method/itCallbacksNoError');
var controller = require('../../../controllers/item');
var method = controller.storeAllForUserStorageSource;
var app = require('../../../app');

var resetAppSpy = require('./routines/resetAppSpy')(app);
var setupObjects = require('./routines/setupObjects');
var verifyStoredItems = require('./routines/verifyStoredItems');

describe('itemController.storeAllForUserStorageSource method', function() {
  beforeEach(db.clear);
  beforeEach(resetAppSpy);
  
  itCallbacksError(method, [{
    when: 'no source parameter provided',
    params: [wh.user, undefined, wh.storage, app],
    error: 'Parameter source undefined or null'
  }, {
    when: 'no user parameter provided',
    params: [undefined, wh.source, wh.storage, app],
    error: 'Parameter user undefined or null'
  }, {
    when: 'user parameter has no id property',
    params: [3, wh.source, wh.storage, app],
    error: 'Parameter user has no id property'
  }, {
    when: 'no source parameter provided',
    params: [wh.user, undefined, wh.storage, app],
    error: 'Parameter source undefined or null'
  }, {
    when: 'source parameter has no id property',
    params: [wh.user, 3, wh.storage, app],
    error: 'Parameter source has no id property'
  }, {
    when: 'no storage parameter provided',
    params: [wh.user, wh.source, undefined, app],
    error: 'Parameter storage undefined or null'
  }, {
    when: 'storage parameter has no id property',
    params: [wh.user, wh.source, 3, app],
    error: 'Parameter storage has no id property'
  }, {
    when: 'app has no emit method property',
    params: [wh.user, wh.source, wh.storage, 3],
    error: 'Parameter app has no emit property'
  }, {
    when: 'emit property of app is not function',
    params: [wh.user, wh.source, wh.storage, { emit: 3 }],
    error: 'Property emit of parameter app is not function'
  }]);

  itCallbacksNoError(method, [{
    context: controller,
    when: 'no app parameter provided',
    params: [wh.user, wh.source, wh.storage, undefined],
    before: function(test, done) {
      setupObjects(test.params[0], test.params[1], test.params[2], undefined, done);
    },
    after: function(test, done) {
      verifyStoredItems(undefined, test.params[3], done);
    }
  }, {
    context: controller,
    when: 'app parameter provided',
    params: [wh.user, wh.source, wh.storage, app],
    before: function(test, done) {
      setupObjects(test.params[0], test.params[1], test.params[2], undefined, done);
    },
    after: function(test, done) {
      verifyStoredItems(undefined, test.params[3], done);
    }
  }]);
});