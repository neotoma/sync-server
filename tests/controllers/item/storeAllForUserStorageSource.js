require('dotenvs')('test');

var app = require('app');
var assertions = require('app/lib/assertions');
var controller = require('app/controllers/item');
var mongoose = require('app/lib/mongoose');
var prepareStoreAll = require('./routines/prepareStoreAll');
var resetAppSpy = require('./routines/resetAppSpy')(app);
var verifyStoredItems = require('./routines/verifyStoredItems');
var wh = require('app/lib/warehouse');

describe('itemController.storeAllForUserStorageSource method', function() {
  beforeEach(mongoose.removeAllCollections);
  beforeEach(resetAppSpy);
  
  assertions.function.callbacks.error(controller.storeAllForUserStorageSource, [{
    when: 'no user parameter provided',
    params: [undefined, wh.one('source'), wh.one('storage')],
    error: 'Parameter user undefined or null'
  }, {
    when: 'user parameter has no id property',
    params: [3, wh.one('source'), wh.one('storage')],
    error: 'Parameter user has no id property'
  }, {
    when: 'no source parameter provided',
    params: [wh.one('user'), undefined, wh.one('storage')],
    error: 'Parameter source undefined or null'
  }, {
    when: 'source parameter has no id property',
    params: [wh.one('user'), 3, wh.one('storage')],
    error: 'Parameter source has no id property'
  }, {
    when: 'no storage parameter provided',
    params: [wh.one('user'), wh.one('source'), undefined],
    error: 'Parameter storage undefined or null'
  }, {
    when: 'storage parameter has no id property',
    params: [wh.one('user'), wh.one('source'), 3],
    error: 'Parameter storage has no id property'
  }]);

  var after = function(done) {
    verifyStoredItems(this.params[1], undefined, undefined, done);
  };

  var before = function(done) {
    prepareStoreAll(this.params[0], this.params[1], this.params[2], undefined, done);
  };

  var timeout = 100000;
  
  assertions.function.callbacks.noError(controller.storeAllForUserStorageSource, [{
    after: after,
    before: before,
    context: controller,
    params: [wh.one('user'), wh.one('source'), wh.one('storage')],
    timeout: timeout,
    when: 'valid parameters provided'
  }]);
});