require('dotenvs')('test');
var app = require('app');
var assertions = require('app/lib/assertions');
var controller = require('app/controllers/item');
var mongoose = require('app/lib/mongoose');
var prepareStoreAll = require('./routines/prepareStoreAll');
var resetAppSpy = require('./routines/resetAppSpy')(app);
var verifyStoredItems = require('./routines/verifyStoredItems');
var wh = require('app/lib/warehouse');

describe('itemController.storeAllForUserStorageSourceContentType method', function() {
  beforeEach(mongoose.removeAllCollections);
  beforeEach(resetAppSpy);
  
  assertions.function.callbacks.error(controller.storeAllForUserStorageSourceContentType, [{
    when: 'no user parameter provided',
    params: [undefined, wh.one('source'), wh.one('storage'), wh.one('contentType'), app],
    error: 'Parameter user undefined or null'
  }, {
    when: 'user parameter has no id property',
    params: [3, wh.one('source'), wh.one('storage'), wh.one('contentType'), app],
    error: 'Parameter user has no id property'
  }, {
    when: 'no source parameter provided',
    params: [wh.one('user'), undefined, wh.one('storage'), wh.one('contentType'), app],
    error: 'Parameter source undefined or null'
  }, {
    when: 'source parameter has no id property',
    params: [wh.one('user'), 3, wh.one('storage'), wh.one('contentType'), app],
    error: 'Parameter source has no id property'
  }, {
    when: 'no storage parameter provided',
    params: [wh.one('user'), wh.one('source'), undefined, wh.one('contentType'), app],
    error: 'Parameter storage undefined or null'
  }, {
    when: 'storage parameter has no id property',
    params: [wh.one('user'), wh.one('source'), 3, wh.one('contentType'), app],
    error: 'Parameter storage has no id property'
  }, {
    when: 'no contentType parameter provided',
    params: [wh.one('user'), wh.one('source'), wh.one('storage'), undefined, app],
    error: 'Parameter contentType undefined or null'
  }, {
    when: 'contentType parameter has no id property',
    params: [wh.one('user'), wh.one('source'), wh.one('storage'), 3, app],
    error: 'Parameter contentType has no id property'
  }, {
    when: 'app has no emit method property',
    params: [wh.one('user'), wh.one('source'), wh.one('storage'), wh.one('contentType'), 3],
    error: 'Parameter app has no emit property'
  }, {
    when: 'emit property of app is not function',
    params: [wh.one('user'), wh.one('source'), wh.one('storage'), wh.one('contentType'), { emit: 3 }],
    error: 'Property emit of parameter app is not function'
  }]);

  var after = function(done) {
    verifyStoredItems(this.params[1], this.params[3], this.params[4], undefined, done);
  };

  var before = function(done) {
    prepareStoreAll(this.params[0], this.params[1], this.params[2], this.params[3], done);
  };

  var timeout = 10000;

  assertions.function.callbacks.noError(controller.storeAllForUserStorageSourceContentType, [{
    after: after,
    before: before,
    context: controller,
    params: [wh.one('user'), wh.one('source'), wh.one('storage'), wh.one('contentType'), app],
    timeout: timeout,
    when: 'app parameter provided'
  }, {
    after: after,
    before: before,
    context: controller,
    params: [wh.one('user'), wh.one('source'), wh.one('storage'), wh.one('contentType'), undefined],
    timeout: timeout,
    when: 'no app parameter provided'
  }]);
});