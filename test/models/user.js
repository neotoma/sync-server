var test_database = 'sync_test';
var assert = require('assert');
var User = require('../../models/user')(test_database);
var mongoose = require('../../lib/mongoose')(test_database);

describe('user', function() {
  before(function(done) {
    mongoose.connection.db.dropDatabase(done)
  });

  before(function() {
    this.user = new User({
      name: 'Jordan Mills',
      email: 'jordan.mills@example.com'
    });
  });

  it('has name', function() {
    assert.equal(this.user.name, 'Jordan Mills');
  });

  it('has email', function() {
    assert.equal(this.user.email, 'jordan.mills@example.com');
  });

  it('can save and get id', function(done) {
    var user = this.user;
    this.user.save(function(error) {
      assert.equal(typeof user.id, 'string');
      done(error);
    });
  });

  it('can be found with findOrCreate', function(done) {
    var self = this;
    User.findOrCreate({
      name: 'Jordan Mills',
      email: 'jordan.mills@example.com'
    }, function(error, user) {
      assert.equal(user.id, self.user.id);
      done(error);
    });
  });

  it('can be created with findOrCreate', function(done) {
    var self = this;
    User.findOrCreate({
      name: 'Chris Mills',
      email: 'chris.mills@example.com'
    }, function(error, user) {
      assert.equal(typeof user.id, 'string');
      assert.notEqual(user.id, self.user.id);
      done(error);
    });
  });
});