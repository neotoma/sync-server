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

  it('throws error instead of returning path when subPath undefined', function(done) {
    try {
      this.storage.path(undefined, this.userStorageAuth);
      done(new Error('Error not thrown by method'));
    } catch (error) {
      assert.equal(error.message, 'Parameter subPath undefined or null');
      done();
    }
  });

  it('throws error instead of returning path when subPath not string', function(done) {
    try {
      this.storage.path(3, this.userStorageAuth);
      done(new Error('Error not thrown by method'));
    } catch (error) {
      assert.equal(error.message, 'Parameter subPath not string');
      done();
    }
  });

  it('throws error instead of returning path when userStorageAuth undefined', function(done) {
    try {
      this.storage.path('foo');
      done(new Error('Error not thrown by method'));
    } catch (error) {
      assert.equal(error.message, 'Parameter userStorageAuth undefined or null');
      done();
    }
  });

  it('throws error instead of returning path when userStorageAuth.storageToken undefined', function(done) {
    try {
      this.storage.path('foo', { foo: 'bar' });
      done(new Error('Error not thrown by method'));
    } catch (error) {
      assert.equal(error.message, 'Parameter userStorageAuth has no storageToken property');
      done();
    }
  });

  it('throws error if attributes undefined upon creation', function(done) {
    StorageFactory.createOne(function(error, storage) {
      assert.equal(error.message, 'Parameter attributes undefined or null');
      done();
    }, null);
  });

  it('throws error if attributes.id undefined upon creation', function(done) {
    StorageFactory.createOne(function(error, storage) {
      assert.equal(error.message, 'Parameter attributes has no id property');
      done();
    }, {
      host: 'drivey.example.com'
    });
  });

  it('throws error if attributes.id not string upon creation', function(done) {
    StorageFactory.createOne(function(error, storage) {
      assert.equal(error.message, 'Property id of attributes not a string');
      done();
    }, {
      id: 3,
      host: 'drivey.example.com'
    });
  });

  it('throws error if attributes.host undefined upon creation', function(done) {
    StorageFactory.createOne(function(error, storage) {
      assert.equal(error.message, 'Parameter attributes has no host property');
      done();
    }, {
      id: 'drivey'
    });
  });

  it('throws error if attributes.host not string upon creation', function(done) {
    StorageFactory.createOne(function(error, storage) {
      assert.equal(error.message, 'Property host of attributes not a string');
      done();
    }, {
      id: 'drivey',
      host: 3
    });
  });

  it('throws error if attributes.path defined and not function upon creation', function(done) {
    StorageFactory.createOne(function(error, storage) {
      assert.equal(error.message, 'Property path of attributes not a function');
      done();
    }, {
      id: 'drivey',
      host: 'drivey.example.com',
      path: 315
    });
  });

  it('returns expected path when attributes.path defined on creation', function(done) {
    var self = this;

    StorageFactory.createOne(function(error, storage) {
      try {
        assert.equal(storage.path('/this/is/a/path', self.userStorageAuth), '/now/this/is/a/path?token=userStorageAuthStorageToken');
        done(error);
      } catch (error) {
        done(error);
      }
    }, {
      id: 'drivey', 
      host: 'drivey.example.com',
      path: function(path, userStorageAuth) {
        return '/now' + path + '?token=' + userStorageAuth.storageToken;
      }
    });
  });
});