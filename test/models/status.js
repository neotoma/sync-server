var config = require('../config');
var assert = require('assert');
var Status = require('../../models/status');
var mongoose = require('../../lib/mongoose');

var statusAttributes = {
  userId: 'statusUserId',
  storageId: 'statusStorageId',
  sourceId: 'statusSourceId',
  contentTypeId: 'statusContentTypeId',
  totalItemsAvailable: 12345,
  totalItemsSynced: 10000,
  totalItemsPending: 2345,
  lastSyncedItemId: 'statusLastSyncedItemId'
};

describe('new status', function() {
  before(function() {
    this.status = new Status(statusAttributes);
  });

  it('has userId', function() {
    assert.equal(this.status.userId, statusAttributes.userId);
  });

  it('has storageId', function() {
    assert.equal(this.status.storageId, statusAttributes.storageId);
  });

  it('has sourceId', function() {
    assert.equal(this.status.sourceId, statusAttributes.sourceId);
  });

  it('has contentTypeId', function() {
    assert.equal(this.status.contentTypeId, statusAttributes.contentTypeId);
  });

  it('has totalItemsAvailable', function() {
    assert.equal(this.status.totalItemsAvailable, statusAttributes.totalItemsAvailable);
  });

  it('has totalItemsSynced', function() {
    assert.equal(this.status.totalItemsSynced, statusAttributes.totalItemsSynced);
  });

  it('has totalItemsPending', function() {
    assert.equal(this.status.totalItemsPending, statusAttributes.totalItemsPending);
  });

  it('has lastSyncedItemId', function() {
    assert.equal(this.status.lastSyncedItemId, statusAttributes.lastSyncedItemId);
  });

  it('can save and have id, timestamps', function(done) {
    var self = this;
    var status = this.status;

    this.status.save(function(error) {
      assert.equal(typeof status.id, 'string');
      assert(status.createdAt);
      assert(status.updatedAt);

      self._id = status._id;
      self.createdAt = status.createdAt;
      self.updatedAt = status.updatedAt;

      done(error);
    });
  });

  it('has toObject', function() {
    var object = this.status.toObject();

    assert.equal(object.id, this._id);
    assert.equal(object.userId, statusAttributes.userId);
    assert.equal(object.storageId, statusAttributes.storageId);
    assert.equal(object.sourceId, statusAttributes.sourceId);
    assert.equal(object.contentTypeId, statusAttributes.contentTypeId);
    assert.equal(object.totalItemsAvailable, statusAttributes.totalItemsAvailable);
    assert.equal(object.totalItemsSynced, statusAttributes.totalItemsSynced);
    assert.equal(object.totalItemsPending, statusAttributes.totalItemsPending);
    assert.equal(object.lastSyncedItemId, statusAttributes.lastSyncedItemId);

    // Hack: asserts failing on equivalency without use of toString()
    assert.equal(object.createdAt.toString(), this.createdAt.toString());
    assert.equal(object.updatedAt.toString(), this.updatedAt.toString());
  });

  it('can be found with findOrCreate', function(done) {
    var self = this;
    Status.findOrCreate(statusAttributes, function(error, status) {
      assert.equal(status.id, self.status.id);
      done(error);
    });
  });

  it('can be created with findOrCreate', function(done) {
    var newStatusAttributes = statusAttributes;
    newStatusAttributes.userId = 'newStatusUserId';

    var self = this;
    Status.findOrCreate(newStatusAttributes, function(error, status) {
      assert.equal(typeof status.id, 'string');
      assert.notEqual(status.id, self.status.id);
      done(error);
    });
  });
});