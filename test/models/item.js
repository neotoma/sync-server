var config = require('../config');
var assert = require('assert');
var Item = require('../../models/item');
var mongoose = require('../../lib/mongoose');

var itemAttributes = {
  userId: 'itemUserId',
  storageId: 'itemStorageId',
  sourceId: 'itemSourceId',
  sourceItemId: 'itemSourceItemId',
  contentTypeId: 'itemContentTypeId',
  syncAttemptedAt: new Date(2015, 1, 1, 1, 1, 1, 1),
  syncVerifiedAt: new Date(2015, 1, 1, 1, 2, 1, 1),
  syncFailedAt: new Date(2015, 1, 1, 1, 3, 1, 1),
  bytes: 12345,
  path: '/path/to/item',
  description: 'Item description',
  error: 'Item error',
  data: {
    foo: 'bar'
  }
};

describe('new item', function() {
  before(function() {
    this.item = new Item(itemAttributes);
  });

  it('has userId', function() {
    assert.equal(this.item.userId, itemAttributes.userId);
  });

  it('has storageId', function() {
    assert.equal(this.item.storageId, itemAttributes.storageId);
  });

  it('has sourceId', function() {
    assert.equal(this.item.sourceId, itemAttributes.sourceId);
  });

  it('has sourceItemId', function() {
    assert.equal(this.item.sourceItemId, itemAttributes.sourceItemId);
  });

  it('has contentTypeId', function() {
    assert.equal(this.item.contentTypeId, itemAttributes.contentTypeId);
  });

  it('has syncAttemptedAt', function() {
    assert.equal(this.item.syncAttemptedAt, itemAttributes.syncAttemptedAt);
  });

  it('has syncVerifiedAt', function() {
    assert.equal(this.item.syncVerifiedAt, itemAttributes.syncVerifiedAt);
  });

  it('has syncFailedAt', function() {
    assert.equal(this.item.syncFailedAt, itemAttributes.syncFailedAt);
  });

  it('has bytes', function() {
    assert.equal(this.item.bytes, itemAttributes.bytes);
  });

  it('has path', function() {
    assert.equal(this.item.path, itemAttributes.path);
  });

  it('has description', function() {
    assert.equal(this.item.description, itemAttributes.description);
  });

  it('has error', function() {
    assert.equal(this.item.error, itemAttributes.error);
  });

  it('has data', function() {
    assert.equal(this.item.data, itemAttributes.data);
  });

  it('can save and has id', function(done) {
    var item = this.item;
    this.item.save(function(error) {
      assert.equal(typeof item.id, 'string');
      done(error);
    });
  });

  it('can be found with findOrCreate', function(done) {
    var self = this;
    Item.findOrCreate(itemAttributes, function(error, item) {
      assert.equal(item.id, self.item.id);
      done(error);
    });
  });

  it('can be created with findOrCreate', function(done) {
    var newItemAttributes = itemAttributes;
    newItemAttributes.userId = 'newItemUserId';

    var self = this;
    Item.findOrCreate(newItemAttributes, function(error, item) {
      assert.equal(typeof item.id, 'string');
      assert.notEqual(item.id, self.item.id);
      done(error);
    });
  });
});