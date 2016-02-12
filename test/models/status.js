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

  it('can save and have id', function(done) {
    var status = this.status;
    this.status.save(function(error) {
      assert.equal(typeof status.id, 'string');
      done(error);
    });
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