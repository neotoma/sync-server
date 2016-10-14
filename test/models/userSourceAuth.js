var config = require('../config');
var assert = require('assert');
var UserSourceAuth = require('../../models/userSourceAuth');
var mongoose = require('../../lib/mongoose');

var userSourceAuthAttributes = {
  userId: 'userSourceAuthUserId',
  sourceId: 'userSourceAuthSourceId',
  sourceToken: 'userSourceAuthSourceToken',
  sourceUserId: 'userSourceAuthSourceUserId'
};

describe('new userSourceAuth', function() {
  before(function() {
    this.userSourceAuth = new UserSourceAuth(userSourceAuthAttributes);
  });

  it('has userId', function() {
    assert.equal(this.userSourceAuth.userId, userSourceAuthAttributes.userId);
  });

  it('has sourceId', function() {
    assert.equal(this.userSourceAuth.sourceId, userSourceAuthAttributes.sourceId);
  });

  it('has sourceToken', function() {
    assert.equal(this.userSourceAuth.sourceToken, userSourceAuthAttributes.sourceToken);
  });

  it('has sourceUserId', function() {
    assert.equal(this.userSourceAuth.sourceUserId, userSourceAuthAttributes.sourceUserId);
  });

  it('can save and have id, timestamps', function(done) {
    var self = this;
    var userSourceAuth = this.userSourceAuth;

    this.userSourceAuth.save(function(error) {
      assert.equal(typeof userSourceAuth.id, 'string');
      assert(userSourceAuth.createdAt);
      assert(userSourceAuth.updatedAt);

      self._id = userSourceAuth._id;
      self.createdAt = userSourceAuth.createdAt;
      self.updatedAt = userSourceAuth.updatedAt;

      done(error);
    });
  });

  it('has toObject', function() {
    var object = this.userSourceAuth.toObject();
    assert.equal(object.id, this._id);
    assert.equal(object.userId, userSourceAuthAttributes.userId);
    assert.equal(object.sourceId, userSourceAuthAttributes.sourceId);
    assert.equal(object.sourceToken, userSourceAuthAttributes.sourceToken);
    assert.equal(object.sourceUserId, userSourceAuthAttributes.sourceUserId);

    // Hack: asserts failing on equivalency without use of toString()
    assert.equal(object.createdAt.toString(), this.createdAt.toString());
    assert.equal(object.updatedAt.toString(), this.updatedAt.toString());
  });

  it('can be found with findOrCreate', function(done) {
    var self = this;
    UserSourceAuth.findOrCreate(userSourceAuthAttributes, function(error, userSourceAuth) {
      assert.equal(userSourceAuth.id, self.userSourceAuth.id);
      done(error);
    });
  });

  it('can be created with findOrCreate', function(done) {
    var newUserSourceAuthAttributes = userSourceAuthAttributes;
    newUserSourceAuthAttributes.userId = 'newUserSourceAuthUserId';

    var self = this;
    UserSourceAuth.findOrCreate(newUserSourceAuthAttributes, function(error, userSourceAuth) {
      assert.equal(typeof userSourceAuth.id, 'string');
      assert.notEqual(userSourceAuth.id, self.userSourceAuth.id);
      done(error);
    });
  });
});