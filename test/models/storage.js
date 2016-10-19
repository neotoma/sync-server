var assert = require('assert');
var async = require('async');
var StorageFactory = require('../factories/storage');
var UserStorageAuthFactory = require('../factories/userStorageAuth');

var attributes = {
  id: 'drivey',
  host: 'drivey.example.com'
};

describe('new storage', function() {
  before(function(done) {
    var self = this;
    
    var createStorage = function(done) {
      StorageFactory.createOne(function(error, storage) {
        done(error, storage);
      }, attributes);
    };

    var createUserStorageAuth = function(done) {
      UserStorageAuthFactory.createOne(function(error, userStorageAuth) {
        done(error, userStorageAuth);
      });
    };

    async.parallel({
      storage: createStorage,
      userStorageAuth: createUserStorageAuth
    }, function(error, results) {
      self.storage = results.storage;
      self.userStorageAuth = results.userStorageAuth;
      done();
    });
  });

  it('has id', function() {
    assert.equal(this.storage.id, attributes.id);
  });

  it('has host', function() {
    assert.equal(this.storage.host, attributes.host);
  });

  it('returns expected path with subPath and userStorageAuth', function() {
    assert.equal(this.storage.path('foo', this.userStorageAuth), '/foo?access_token=userStorageAuthStorageToken');
  });

  it('throws error instead of returning path when subPath undefined');

  it('throws error instead of returning path when subPath not string');

  it('throws error instead of returning path when userStorageAuth undefined');

  it('throws error instead of returning path when userStorageAuth.storageToken undefined');

  it('throws error if attributes.id undefined upon creation');

  it('throws error if attributes.id not string upon creation');

  it('throws error if attributes.host undefined upon creation');

  it('throws error if attributes.host undefined upon creation');

  it('throws error if attributes.path defined and not function upon creation');

  it('returns expected path when attributes.path defined on creation');
});