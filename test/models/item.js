require('../../lib/prototypes/object.js');
var db = require('../db');
var wh = require('../warehouse/item');
var assert = require('assert');
var pluralize = require('pluralize');
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

  it('has storageAttemptedAt', function() {
    assert.equal(this.item.storageAttemptedAt, wh.attributes.storageAttemptedAt);
  });

  it('has storageVerifiedAt', function() {
    assert.equal(this.item.storageVerifiedAt, wh.attributes.storageVerifiedAt);
  });

  it('has storageFailedAt', function() {
    assert.equal(this.item.storageFailedAt, wh.attributes.storageFailedAt);
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
    assert.deepEqual(object.storageAttemptedAt.toString(), wh.attributes.storageAttemptedAt.toString());
    assert.deepEqual(object.storageVerifiedAt.toString(), wh.attributes.storageVerifiedAt.toString());
    assert.deepEqual(object.storageFailedAt.toString(), wh.attributes.storageFailedAt.toString());

    assert.equal(object.bytes, wh.attributes.bytes);
    assert.equal(object.path, wh.attributes.path);
    assert.equal(object.description, wh.attributes.description);
    assert.equal(object.error, wh.attributes.error);
    assert.equal(object.data.foo, wh.attributes.data.foo);
  });

  it('has storagePath', function() {
    assert.equal(this.item.storagePath(), '/' + pluralize(wh.attributes.contentTypeId) + '/' + this.item.id + '.json');
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
    var attributes = Object.clone(wh.attributes);
    attributes.userId = attributes.userId + 'x';

    var self = this;
    Item.findOrCreate(attributes, function(error, item) {
      assert.equal(typeof item.id, 'string');
      assert.notEqual(item.id, self.item.id);
      done(error);
    });
  });
});