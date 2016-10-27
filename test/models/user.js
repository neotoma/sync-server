var db = require('../db');
var wh = require('../warehouse/user');
var assert = require('assert');
var User = require('../../models/user');

describe('new user', function() {
  before(db.clear);
  
  before(function() {
    this.user = new User(wh.attributes);
  });

  it('has name', function() {
    assert.equal(this.user.name, wh.attributes.name);
  });

  it('has email', function() {
    assert.equal(this.user.email, wh.attributes.email);
  });

  it('can save and have id, timestamps', function(done) {
    var self = this;
    var user = this.user;

    this.user.save(function(error) {
      assert.equal(typeof user.id, 'string');
      assert(user.createdAt);
      assert(user.updatedAt);

      self._id = user._id;
      self.createdAt = user.createdAt;
      self.updatedAt = user.updatedAt;

      done(error);
    });
  });

  it('has toObject', function() {
    var object = this.user.toObject();
    assert.equal(object.id, this._id);
    assert.equal(object.admin, wh.attributes.admin);
    assert.equal(object.name, wh.attributes.name);
    assert.equal(object.email, wh.attributes.email);
    assert.deepEqual(object.createdAt.toString(), this.createdAt.toString());
    assert.deepEqual(object.updatedAt.toString(), this.updatedAt.toString());
  });

  it('can be found with findOrCreate', function(done) {
    var self = this;
    User.findOrCreate(wh.attributes, function(error, user) {
      assert.equal(user.id, self.user.id);
      done(error);
    });
  });

  it('can be created with findOrCreate', function(done) {
    var newUserAttributes = wh.attributes;
    newUserAttributes.name = 'Chris Mills';

    var self = this;
    User.findOrCreate(newUserAttributes, function(error, user) {
      assert.equal(typeof user.id, 'string');
      assert.notEqual(user.id, self.user.id);
      done(error);
    });
  });

  describe('without admin value', function() {
    before(function(done) {
      var self = this;
      delete wh.attributes.admin;

      User.create(wh.attributes, function(error, user) {
        self.user = user;
        done(error);
      });
    });

    it('defaults admin value to false', function() {
      assert.equal(this.user.admin, false);
    });
  });
});