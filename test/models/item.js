var db = require('../db');
var wh = require('../warehouse/item');
var assert = require('assert');
var Item = require('../../models/item');

describe('new item', function() {
  before(db.clear);
  
  before(function() {
    this.item = new Item(wh.attributes);
  });

  it('has userId', function() {
    assert.equal(this.item.userId, wh.attributes.userId);
  });

  it('has storageId', function() {
    assert.equal(this.item.storageId, wh.attributes.storageId);
  });

  it('has sourceId', function() {
    assert.equal(this.item.sourceId, wh.attributes.sourceId);
  });

  it('has sourceItemId', function() {
    assert.equal(this.item.sourceItemId, wh.attributes.sourceItemId);
  });

  it('has contentTypeId', function() {
    assert.equal(this.item.contentTypeId, wh.attributes.contentTypeId);
  });

  it('has syncAttemptedAt', function() {
    assert.equal(this.item.syncAttemptedAt, wh.attributes.syncAttemptedAt);
  });

  it('has syncVerifiedAt', function() {
    assert.equal(this.item.syncVerifiedAt, wh.attributes.syncVerifiedAt);
  });

  it('has syncFailedAt', function() {
    assert.equal(this.item.syncFailedAt, wh.attributes.syncFailedAt);
  });

  it('has bytes', function() {
    assert.equal(this.item.bytes, wh.attributes.bytes);
  });

  it('has path', function() {
    assert.equal(this.item.path, wh.attributes.path);
  });

  it('has description', function() {
    assert.equal(this.item.description, wh.attributes.description);
  });

  it('has error', function() {
    assert.equal(this.item.error, wh.attributes.error);
  });

  it('has data', function() {
    assert.equal(this.item.data, wh.attributes.data);
  });

  it('has toObject', function() {
    var object = this.item.toObject();
    assert.equal(object.userId, wh.attributes.userId);
    assert.equal(object.storageId, wh.attributes.storageId);
    assert.equal(object.sourceId, wh.attributes.sourceId);
    assert.equal(object.sourceItemId, wh.attributes.sourceItemId);
    assert.equal(object.contentTypeId, wh.attributes.contentTypeId);
    assert.deepEqual(object.syncAttemptedAt.toString(), wh.attributes.syncAttemptedAt.toString());
    assert.deepEqual(object.syncVerifiedAt.toString(), wh.attributes.syncVerifiedAt.toString());
    assert.deepEqual(object.syncFailedAt.toString(), wh.attributes.syncFailedAt.toString());

    assert.equal(object.bytes, wh.attributes.bytes);
    assert.equal(object.path, wh.attributes.path);
    assert.equal(object.description, wh.attributes.description);
    assert.equal(object.error, wh.attributes.error);
    assert.equal(object.data.foo, wh.attributes.data.foo);
  });

  it('can save and have id, timestamps', function(done) {
    var item = this.item;
    this.item.save(function(error) {
      assert.equal(typeof item.id, 'string');
      assert(item.createdAt);
      assert(item.updatedAt);
      done(error);
    });
  });

  it('can be found with findOrCreate', function(done) {
    var self = this;
    Item.findOrCreate(wh.attributes, function(error, item) {
      assert.equal(item.id, self.item.id);
      done(error);
    });
  });

  it('can be created with findOrCreate', function(done) {
    var newItemAttributes = wh.attributes;
    newItemAttributes.userId = 'newItemUserId';

    var self = this;
    Item.findOrCreate(newItemAttributes, function(error, item) {
      assert.equal(typeof item.id, 'string');
      assert.notEqual(item.id, self.item.id);
      done(error);
    });
  });
});