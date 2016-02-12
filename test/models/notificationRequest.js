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

  it('can save and have id', function(done) {
    var notificationRequest = this.notificationRequest;
    this.notificationRequest.save(function(error) {
      assert.equal(typeof notificationRequest.id, 'string');
      done(error);
    });
  });
});