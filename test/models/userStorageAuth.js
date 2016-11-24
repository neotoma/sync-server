require('../../lib/prototypes/object.js');
var db = require('../db');
var wh = require('../warehouse/userStorageAuth');
var assert = require('assert');
var UserStorageAuth = require('../../models/userStorageAuth');

describe('new userStorageAuth', function() {
  before(db.clear);

  before(function() {
    this.userStorageAuth = new UserStorageAuth(wh.attributes);
  });

  it('has userId', function() {
    assert.equal(this.userStorageAuth.userId, wh.attributes.userId);
  });

  it('has storageId', function() {
    assert.equal(this.userStorageAuth.storageId, wh.attributes.storageId);
  });

  it('has storageToken', function() {
    assert.equal(this.userStorageAuth.storageToken, wh.attributes.storageToken);
  });

  it('has storageUserId', function() {
    assert.equal(this.userStorageAuth.storageUserId, wh.attributes.storageUserId);
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
    assert.equal(object.userId, wh.attributes.userId);
    assert.equal(object.sourceId, wh.attributes.sourceId);
    assert.equal(object.sourceToken, wh.attributes.sourceToken);
    assert.equal(object.sourceUserId, wh.attributes.sourceUserId);
    assert.deepEqual(object.createdAt, this.createdAt);
    assert.deepEqual(object.updatedAt, this.updatedAt);
  });

  it('can be found with findOrCreate', function(done) {
    var self = this;
    UserStorageAuth.findOrCreate(wh.attributes, function(error, userStorageAuth) {
      assert.equal(userStorageAuth.id, self.userStorageAuth.id);
      done(error);
    });
  });

  it('can be created with findOrCreate', function(done) {
    var attributes = Object.clone(wh.attributes);
    attributes.userId = wh.attributes.userId + 'x';

    var self = this;
    UserStorageAuth.findOrCreate(attributes, function(error, userStorageAuth) {
      assert.equal(typeof userStorageAuth.id, 'string');
      assert.notEqual(userStorageAuth.id, self.userStorageAuth.id);
      done(error);
    });
  });
});