var config = require('../config');
var assert = require('assert');
var UserStorageAuth = require('../../models/userStorageAuth');
var mongoose = require('../../lib/mongoose');

var userStorageAuthAttributes = {
  userId: 'userStorageAuthUserId',
  storageId: 'userStorageAuthStorageId',
  storageToken: 'userStorageAuthStorageToken',
  storageUserId: 'userStorageAuthStorageUserId'
};

describe('new userStorageAuth', function() {
  before(function() {
    this.userStorageAuth = new UserStorageAuth(userStorageAuthAttributes);
  });

  it('has userId', function() {
    assert.equal(this.userStorageAuth.userId, userStorageAuthAttributes.userId);
  });

  it('has storageId', function() {
    assert.equal(this.userStorageAuth.storageId, userStorageAuthAttributes.storageId);
  });

  it('has storageToken', function() {
    assert.equal(this.userStorageAuth.storageToken, userStorageAuthAttributes.storageToken);
  });

  it('has storageUserId', function() {
    assert.equal(this.userStorageAuth.storageUserId, userStorageAuthAttributes.storageUserId);
  });

  it('can save and have id, timestamps', function(done) {
    var self = this;
    var userStorageAuth = this.userStorageAuth;

    this.userStorageAuth.save(function(error) {
      assert.equal(typeof userStorageAuth.id, 'string');
      assert(userStorageAuth.createdAt);
      assert(userStorageAuth.updatedAt);

      self._id = userStorageAuth._id;
      self.createdAt = userStorageAuth.createdAt;
      self.updatedAt = userStorageAuth.updatedAt;

      done(error);
    });
  });

  it('has toObject', function() {
    var object = this.userStorageAuth.toObject();
    assert.equal(object.id, this._id);
    assert.equal(object.userId, userStorageAuthAttributes.userId);
    assert.equal(object.sourceId, userStorageAuthAttributes.sourceId);
    assert.equal(object.sourceToken, userStorageAuthAttributes.sourceToken);
    assert.equal(object.sourceUserId, userStorageAuthAttributes.sourceUserId);

    // Hack: asserts failing on equivalency without use of toString()
    assert.equal(object.createdAt.toString(), this.createdAt.toString());
    assert.equal(object.updatedAt.toString(), this.updatedAt.toString());
  });

  it('can be found with findOrCreate', function(done) {
    var self = this;
    UserStorageAuth.findOrCreate(userStorageAuthAttributes, function(error, userStorageAuth) {
      assert.equal(userStorageAuth.id, self.userStorageAuth.id);
      done(error);
    });
  });

  it('can be created with findOrCreate', function(done) {
    var newUserStorageAuthAttributes = userStorageAuthAttributes;
    newUserStorageAuthAttributes.userId = 'newUserStorageAuthUserId';

    var self = this;
    UserStorageAuth.findOrCreate(newUserStorageAuthAttributes, function(error, userStorageAuth) {
      assert.equal(typeof userStorageAuth.id, 'string');
      assert.notEqual(userStorageAuth.id, self.userStorageAuth.id);
      done(error);
    });
  });
});