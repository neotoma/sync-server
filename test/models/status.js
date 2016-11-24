require('../../lib/prototypes/object.js');
var db = require('../db');
var wh = require('../warehouse/status');
var assert = require('assert');
var Status = require('../../models/status');

describe('new status', function() {
  before(db.clear);
  
  before(function() {
    this.status = new Status(wh.attributes);
  });

  it('has userId', function() {
    assert.equal(this.status.userId, wh.attributes.userId);
  });

  it('has storageId', function() {
    assert.equal(this.status.storageId, wh.attributes.storageId);
  });

  it('has sourceId', function() {
    assert.equal(this.status.sourceId, wh.attributes.sourceId);
  });

  it('has contentTypeId', function() {
    assert.equal(this.status.contentTypeId, wh.attributes.contentTypeId);
  });

  it('has totalItemsAvailable', function() {
    assert.equal(this.status.totalItemsAvailable, wh.attributes.totalItemsAvailable);
  });

  it('has totalItemsSynced', function() {
    assert.equal(this.status.totalItemsSynced, wh.attributes.totalItemsSynced);
  });

  it('has totalItemsPending', function() {
    assert.equal(this.status.totalItemsPending, wh.attributes.totalItemsPending);
  });

  it('has lastSyncedItemId', function() {
    assert.equal(this.status.lastSyncedItemId, wh.attributes.lastSyncedItemId);
  });

  it('can save and have id, timestamps', function(done) {
    var self = this;
    var status = this.status;

    this.status.save(function(error) {
      assert.equal(typeof status.id, 'string');
      assert(status.createdAt);
      assert(status.updatedAt);

      self.id = status.id;
      self.createdAt = status.createdAt;
      self.updatedAt = status.updatedAt;

      done(error);
    });
  });

  it('has toObject', function() {
    var object = this.status.toObject();
    assert.equal(object.id, this.id);
    assert.equal(object.userId, wh.attributes.userId);
    assert.equal(object.storageId, wh.attributes.storageId);
    assert.equal(object.sourceId, wh.attributes.sourceId);
    assert.equal(object.contentTypeId, wh.attributes.contentTypeId);
    assert.equal(object.totalItemsAvailable, wh.attributes.totalItemsAvailable);
    assert.equal(object.totalItemsSynced, wh.attributes.totalItemsSynced);
    assert.equal(object.totalItemsPending, wh.attributes.totalItemsPending);
    assert.equal(object.lastSyncedItemId, wh.attributes.lastSyncedItemId);
    assert.deepEqual(object.createdAt.toString(), this.createdAt.toString());
    assert.deepEqual(object.updatedAt.toString(), this.updatedAt.toString());
  });

  it('can be found with findOrCreate', function(done) {
    var self = this;

    Status.findOrCreate(wh.attributes, function(error, status) {
      assert.equal(status.id, self.id);
      done(error);
    });
  });

  it('can be created with findOrCreate', function(done) {
    var self = this;
    var attributes = Object.clone(wh.attributes);
    attributes.userId = attributes.userId + 'x';

    Status.findOrCreate(attributes, function(error, status) {
      assert.equal(typeof status.id, 'string');
      assert.notEqual(status.id, self.status.id);
      done(error);
    });
  });
});