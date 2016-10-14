var assert = require('assert');
var NotificationRequest = require('../../models/notificationRequest');

var notificationRequestAttributes = {
  userId: 'notificationRequestUserId',
  sourceId: 'notificationRequestSourceId',
  storageId: 'notificationRequestStorageId',
  event: 'notificationRequestEvent'
};

describe('new notificationRequest', function() {
  before(function() {
    this.notificationRequest = new NotificationRequest(notificationRequestAttributes);
  });

  it('has userId', function() {
    assert.equal(this.notificationRequest.userId, notificationRequestAttributes.userId);
  });

  it('has sourceId', function() {
    assert.equal(this.notificationRequest.sourceId, notificationRequestAttributes.sourceId);
  });

  it('has storageId', function() {
    assert.equal(this.notificationRequest.storageId, notificationRequestAttributes.storageId);
  });

  it('has event', function() {
    assert.equal(this.notificationRequest.event, notificationRequestAttributes.event);
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
    assert.equal(object.userId, notificationRequestAttributes.userId);
    assert.equal(object.storageId, notificationRequestAttributes.storageId);
    assert.equal(object.sourceId, notificationRequestAttributes.sourceId);
    assert.equal(object.event, notificationRequestAttributes.event);

    // Hack: asserts failing on equivalency without use of toString()
    assert.equal(object.createdAt.toString(), this.createdAt.toString());
    assert.equal(object.updatedAt.toString(), this.updatedAt.toString());
  });
});