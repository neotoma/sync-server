require('park-ranger')();
var assertions = require('app/lib/assertions');
var controller = require('app/controllers/item');
var mongoose = require('app/lib/mongoose');
var prepareStoreAll = require('./routines/prepareStoreAll');
var resetAppSpy = require('./routines/resetAppSpy');
var verifyStoredItems = require('./routines/verifyStoredItems');
var wh = require('app/lib/warehouse');

describe('itemController.storeItemsPage method', function() {
  beforeEach(mongoose.removeAllCollections);
  beforeEach(resetAppSpy);
  
  assertions.function.callbacks.error(controller.storeItemsPage, [{
    when: 'no user parameter provided',
    params: [undefined, wh.one('source'), wh.one('storage'), wh.one('contentType'), wh.pagination(), wh.one('job')],
    error: 'Parameter user undefined or null'
  }, {
    when: 'user parameter has no id property',
    params: [3, wh.one('source'), wh.one('storage'), wh.one('contentType'), wh.pagination(), wh.one('job')],
    error: 'Parameter user has no id property'
  }, {
    when: 'no source parameter provided',
    params: [wh.one('user'), undefined, wh.one('storage'), wh.one('contentType'), wh.pagination(), wh.one('job')],
    error: 'Parameter source undefined or null'
  }, {
    when: 'source parameter has no id property',
    params: [wh.one('user'), 3, wh.one('storage'), wh.one('contentType'), wh.pagination(), wh.one('job')],
    error: 'Parameter source has no id property'
  }, {
    when: 'no storage parameter provided',
    params: [wh.one('user'), wh.one('source'), undefined, wh.one('contentType'), wh.pagination(), wh.one('job')],
    error: 'Parameter storage undefined or null'
  }, {
    when: 'storage parameter has no id property',
    params: [wh.one('user'), wh.one('source'), 3, wh.one('contentType'), wh.pagination(), wh.one('job')],
    error: 'Parameter storage has no id property'
  }, {
    when: 'no contentType parameter provided',
    params: [wh.one('user'), wh.one('source'), wh.one('storage'), undefined, wh.pagination(), wh.one('job')],
    error: 'Parameter contentType undefined or null'
  }, {
    when: 'contentType parameter has no id property',
    params: [wh.one('user'), wh.one('source'), wh.one('storage'), 3, wh.pagination(), wh.one('job')],
    error: 'Parameter contentType has no id property'
  }, {
    when: 'no pagination parameter provided',
    params: [wh.one('user'), wh.one('source'), wh.one('storage'), wh.one('contentType'), undefined, wh.one('job')],
    error: 'Parameter pagination undefined or null'
  }]);

  assertions.function.callbacks.noError(controller.storeItemsPage, [{
    context: controller,
    when: 'valid parameters provided',
    params: [wh.one('user'), wh.one('source'), wh.one('storage'), wh.one('contentType'), wh.pagination(), undefined],
    before: function(done) {
      prepareStoreAll(this.params[0], this.params[1], this.params[2], this.params[3], done);
    },
    after: function(done) {
      verifyStoredItems(this.params[1], this.params[3], 1, done);
    }
  }]);
});