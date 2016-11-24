require('../../lib/prototypes/object.js');
var db = require('../db');
var wh = require('../warehouse/userSourceAuth');
var assert = require('assert');
var UserSourceAuth = require('../../models/userSourceAuth');

describe('new userSourceAuth', function() {
  before(db.clear);
  
  before(function() {
    this.userSourceAuth = new UserSourceAuth(wh.attributes);
  });

  it('has userId', function() {
    assert.equal(this.userSourceAuth.userId, wh.attributes.userId);
  });

  it('has sourceId', function() {
    assert.equal(this.userSourceAuth.sourceId, wh.attributes.sourceId);
  });

  it('has sourceToken', function() {
    assert.equal(this.userSourceAuth.sourceToken, wh.attributes.sourceToken);
  });

  it('has sourceUserId', function() {
    assert.equal(this.userSourceAuth.sourceUserId, wh.attributes.sourceUserId);
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
    assert.equal(object.userId, wh.attributes.userId);
    assert.equal(object.sourceId, wh.attributes.sourceId);
    assert.equal(object.sourceToken, wh.attributes.sourceToken);
    assert.equal(object.sourceUserId, wh.attributes.sourceUserId);
    assert.deepEqual(object.createdAt.toString(), this.createdAt.toString());
    assert.deepEqual(object.updatedAt.toString(), this.updatedAt.toString());
  });

  it('can be found with findOrCreate', function(done) {
    var self = this;
    UserSourceAuth.findOrCreate(wh.attributes, function(error, userSourceAuth) {
      assert.equal(userSourceAuth.id, self.userSourceAuth.id);
      done(error);
    });
  });

  it('can be created with findOrCreate', function(done) {
    var attributes = Object.clone(wh.attributes);
    attributes.userId = wh.attributes.userId + 'x';

    var self = this;
    UserSourceAuth.findOrCreate(attributes, function(error, userSourceAuth) {
      assert.equal(typeof userSourceAuth.id, 'string');
      assert.notEqual(userSourceAuth.id, self.userSourceAuth.id);
      done(error);
    });
  });
});