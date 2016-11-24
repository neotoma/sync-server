var db = require('../db');
var wh = require('../warehouse/notificationRequest');
var assert = require('assert');
var NotificationRequest = require('../../models/notificationRequest');

describe('new notificationRequest', function() {
  before(db.clear);
  
  before(function() {
    this.notificationRequest = new NotificationRequest(wh.attributes);
  });

  it('has userId', function() {
    assert.equal(this.notificationRequest.userId, wh.attributes.userId);
  });

  it('has sourceId', function() {
    assert.equal(this.notificationRequest.sourceId, wh.attributes.sourceId);
  });

  it('has storageId', function() {
    assert.equal(this.notificationRequest.storageId, wh.attributes.storageId);
  });

  it('has event', function() {
    assert.equal(this.notificationRequest.event, wh.attributes.event);
  });

  it('can save and have id, timestamps', function(done) {
    var self = this;
    var notificationRequest = this.notificationRequest;

    this.notificationRequest.save(function(error) {
      assert.equal(typeof notificationRequest.id, 'string');
      assert(notificationRequest.createdAt);
      assert(notificationRequest.updatedAt);

      self._id = notificationRequest._id;
      self.createdAt = notificationRequest.createdAt;
      self.updatedAt = notificationRequest.updatedAt;
      
      done(error);
    });
  });

  it('has toObject', function() {
    var object = this.notificationRequest.toObject();
    assert.equal(object.id, this._id);
    assert.equal(object.userId, wh.attributes.userId);
    assert.equal(object.storageId, wh.attributes.storageId);
    assert.equal(object.sourceId, wh.attributes.sourceId);
    assert.equal(object.event, wh.attributes.event);
    assert.deepEqual(object.createdAt.toString(), this.createdAt.toString());
    assert.deepEqual(object.updatedAt.toString(), this.updatedAt.toString());
  });
});