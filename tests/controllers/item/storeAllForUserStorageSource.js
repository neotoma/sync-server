require('park-ranger')();

var assertFunctionCallbacksError = require('app/lib/assertions/functionCallbacksError'),
  assertFunctionCallbacksNoError = require('app/lib/assertions/functionCallbacksNoError'),
  mongoose = require('app/lib/mongoose'),
  prepareStoreAll = require('./routines/prepareStoreAll'),
  resetAppSpy = require('./routines/resetAppSpy'),
  storeAllForUserStorageSource = require('app/controllers/item/storeAllForUserStorageSource'),
  verifyStoredItems = require('./routines/verifyStoredItems'),
  wh = require('app/lib/warehouse');

describe('itemController storeAllForUserStorageSource method', function() {
  beforeEach(mongoose.removeAllCollections);
  beforeEach(resetAppSpy);
  
  assertFunctionCallbacksError(storeAllForUserStorageSource, [{
    when: 'no user parameter provided',
    params: [undefined, wh.one('source'), wh.one('storage'), wh.one('job')],
    error: 'Parameter user undefined or null'
  }, {
    when: 'user parameter has no id property',
    params: [3, wh.one('source'), wh.one('storage'), wh.one('job')],
    error: 'Parameter user has no id property'
  }, {
    when: 'no source parameter provided',
    params: [wh.one('user'), undefined, wh.one('storage'), wh.one('job')],
    error: 'Parameter source undefined or null'
  }, {
    when: 'source parameter has no id property',
    params: [wh.one('user'), 3, wh.one('storage'), wh.one('job')],
    error: 'Parameter source has no id property'
  }, {
    when: 'no storage parameter provided',
    params: [wh.one('user'), wh.one('source'), undefined, wh.one('job')],
    error: 'Parameter storage undefined or null'
  }, {
    when: 'storage parameter has no id property',
    params: [wh.one('user'), wh.one('source'), 3, wh.one('job')],
    error: 'Parameter storage has no id property'
  }]);

  var after = function(done) {
    verifyStoredItems(this.params[1], undefined, undefined, done);
  };

  var before = function(done) {
    prepareStoreAll(this.params[0], this.params[1], this.params[2], undefined, done);
  };
  
  assertFunctionCallbacksNoError(storeAllForUserStorageSource, [{
    after: after,
    before: before,
    params: [wh.one('user'), wh.one('source'), wh.one('storage'), undefined],
    timeout: 100000,
    when: 'valid parameters provided'
  }]);
});
