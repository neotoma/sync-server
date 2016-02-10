var config = require('../config');
var assert = require('assert');
var UserSourceAuth = require('../../models/user_source_auth');
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

  it('can save and have id', function(done) {
    var userSourceAuth = this.userSourceAuth;
    this.userSourceAuth.save(function(error) {
      assert.equal(typeof userSourceAuth.id, 'string');
      done(error);
    });
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