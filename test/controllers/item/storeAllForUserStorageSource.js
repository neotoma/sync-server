var db = require('../../db');
var wh = require('../../warehouse');
var itCallbacksError = require('../../method/itCallbacksError');
var controller = require('../../../controllers/item');
var method = controller.storeAllForUserStorageSource;
var app = require('../../../app');

describe('itemController.storeAllForUserStorageSource method', function() {
  beforeEach(db.clear);
  
  itCallbacksError(method, [{
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
    error: 'Parameter app has no emit function'
  }]);
});