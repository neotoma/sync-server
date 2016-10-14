var config = require('../config');
var assert = require('assert');
var User = require('../../models/user');
var mongoose = require('../../lib/mongoose');

var userAttributes = {
  admin: false,
  name: 'Jordan Mills',
  email: 'jordan.mills@example.com'
};

describe('new user', function() {
  before(function() {
    this.user = new User(userAttributes);
  });

  it('has name', function() {
    assert.equal(this.user.name, userAttributes.name);
  });

  it('has email', function() {
    assert.equal(this.user.email, userAttributes.email);
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
    assert.equal(object.admin, userAttributes.admin);
    assert.equal(object.name, userAttributes.name);
    assert.equal(object.email, userAttributes.email);

    // Hack: asserts failing on equivalency without use of toString()
    assert.equal(object.createdAt.toString(), this.createdAt.toString());
    assert.equal(object.updatedAt.toString(), this.updatedAt.toString());
  });

  it('can be found with findOrCreate', function(done) {
    var self = this;
    User.findOrCreate(userAttributes, function(error, user) {
      assert.equal(user.id, self.user.id);
      done(error);
    });
  });

  it('can be created with findOrCreate', function(done) {
    var newUserAttributes = userAttributes;
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
      delete userAttributes.admin;

      User.create(userAttributes, function(error, user) {
        self.user = user;
        done(error);
      });
    });

    it('defaults admin value to false', function() {
      assert.equal(this.user.admin, false);
    });
  });
});