var config = require('../config');
var async = require('async');
var assert = require('assert');
var controller = require('../../controllers/item');
var StorageFactory = require('../factories/storage');
var UserFactory = require('../factories/user');
var UserStorageAuth = require('../../models/userStorageAuth');
var StorageNock = require('../nocks/storage');
var nock = require('nock');
var url = require('url');

var nockGet = function(requestUrl, responseBody, responseStatus) {
  var urlObject = url.parse(requestUrl);
  var hostname = urlObject.protocol + '//' + urlObject.host;
  var status = responseStatus ? responseStatus : 200;
  nock(hostname).get(urlObject.path).reply(responseStatus, responseBody);
};

var expectError = function(methodCall, errorMessage, done) {
  try {
    methodCall();
    done(new Error('Error not thrown by method'));
  } catch (error) {
    assert.equal(error.message, errorMessage);
    done();
  }
};

describe('item controller', function() {
  describe('getFile method', function() {
    var method = function(params) {
      controller.getFile(params[0], params[1]);
    }

    var jsonUrl = 'http://myhost/foo.json';
    var jpegUrl = 'http://myhost/foo.jpg';
    var jsonData = { foo: 'bar' };
    var jpegData = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
    var done = function(error, data) {};

    var errorThrowTests = [{
      desc: 'no url parameter provided',
      params: [undefined, done],
      msg: 'Parameter url undefined or null',
    }, {
      desc: 'url parameter not string',
      params: [3, done],
      msg: 'Parameter url not a string',
    }, {
      desc: 'url parameter has no extension',
      params: ['foo', done],
      msg: 'Parameter url has no extension',
    }, {
      desc: 'url parameter has unsupported extension',
      params: ['foo.xyz', done],
      msg: 'Parameter url extension indicates unsupported MIME type',
    }, {
      desc: 'no done parameter provided',
      params: [jsonUrl, undefined],
      msg: 'Parameter done undefined or null',
    }, {
      desc: 'done parameter not function',
      params: [jsonUrl, 3],
      msg: 'Parameter done not a function',
    }];

    errorThrowTests.forEach(function(test) {
      it('throws error if ' + test.desc, function(done) {
        try {
          method(test.params);
          done(new Error('Error not thrown by method'));
        } catch (error) {
          assert.equal(error.message, test.msg);
          done();
        }
      });
    });

    it('returns json file content if provided valid url and callback', function(done) {
      nockGet(jsonUrl, jsonData);

      controller.getFile(jsonUrl, function(error, body) {
        try {
          assert.equal(JSON.parse(body).foo, jsonData.foo);
          done(error);
        } catch (error) {
          done(error);
        }
      });
    });

    it('returns jpeg file content if provided valid url and callback', function(done) {
      nockGet(jpegUrl, jpegData);

      controller.getFile(jpegUrl, function(error, body) {
        try {
          assert.equal(body, 'buffer');
          done(error);
        } catch (error) {
          done(error);
        }
      });
    });

    it('returns error if provided invalid url', function(done) {
      var url = 'http://myhost/filedoesntexist.json';

      nockGet(url, jsonData, 404);

      controller.getFile(url, function(error, body) {
        try {
          assert.equal(error.message, 'Failed to get file');
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('returns error if provided url without authorization', function(done) {
      nockGet(jsonUrl, jsonData, 401);

      controller.getFile(jsonUrl, function(error, body) {
        try {
          assert.equal(error.message, 'Failed to get file because of unauthorized request');
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  describe('storeFile method', function() {
    before(function(done) {
      var self = this;

      this.jsonPath = 'foo.json';
      this.jsonData = { foo: 'bar' };

      this.bufferPath = 'foo.jpg';
      this.bufferData = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
      
      var createStorage = function(done) {
        StorageFactory.createOne(function(error, storage) {
          done(error, storage);
        });
      };

      var createUser = function(done) {
        UserFactory.createOne(function(error, user) {
          done(error, user);
        });
      };

      async.parallel({
        storage: createStorage,
        user: createUser
      }, function(error, results) {
        self.storage = results.storage;
        self.user = results.user;

        UserStorageAuth.create({
          userId: self.user.id,
          storageId: self.storage.id,
          storageToken: 'userStorageAuthStorageToken',
          storageUserId: 'userStorageAuthUserId'
        }, function(error, userStorageAuth) {
          self.userStorageAuth = userStorageAuth;
          StorageNock(self.storage, userStorageAuth);
          done(error);
        });
      });
    });

    it('throws error if no user parameter provided', function(done) {
      try {
        controller.storeFile(undefined, this.storage, this.jsonPath, this.jsonData, function(error, data) {
          done(new Error('Error not thrown by method'));
        });
      } catch (error) {
        assert.equal(error.message, 'Parameter user undefined or null');
        done();
      }
    });

    it('throws error if user parameter has no id property', function(done) {
      try {
        controller.storeFile({ foo: 'bar' }, this.storage, this.jsonPath, this.jsonData, function(error, data) {
          done(new Error('Error not thrown by method'));
        });
      } catch (error) {
        assert.equal(error.message, 'Parameter user has no id property');
        done();
      }
    });

    it('throws error if no storage parameter provided', function(done) {
      try {
        controller.storeFile(this.user, undefined, this.jsonPath, this.jsonData, function(error, data) {
          done(new Error('Error not thrown by method'));
        });
      } catch (error) {
        assert.equal(error.message, 'Parameter storage undefined or null');
        done();
      }
    });

    it('throws error if storage parameter has no id property', function(done) {
      try {
        controller.storeFile(this.user, { foo: 'bar' }, this.jsonPath, this.jsonData, function(error, data) {
          done(new Error('Error not thrown by method'));
        });
      } catch (error) {
        assert.equal(error.message, 'Parameter storage has no id property');
        done();
      }
    });

    it('throws error if storage parameter has no host property', function(done) {
      try {
        controller.storeFile(this.user, { id: 'bar' }, this.jsonPath, this.jsonData, function(error, data) {
          done(new Error('Error not thrown by method'));
        });
      } catch (error) {
        assert.equal(error.message, 'Parameter storage has no host property');
        done();
      }
    });

    it('throws error if storage parameter has no path property', function(done) {
      try {
        controller.storeFile(this.user, { id: 'bar', host: 'weee' }, this.jsonPath, this.jsonData, function(error, data) {
          done(new Error('Error not thrown by method'));
        });
      } catch (error) {
        assert.equal(error.message, 'Parameter storage has no path property');
        done();
      }
    });

    it('throws error if path property of storage parameter not function', function(done) {
      try {
        controller.storeFile(this.user, { id: 'bar', host: 'weee', path: 3 }, this.jsonPath, this.jsonData, function(error, data) {
          done(new Error('Error not thrown by method'));
        });
      } catch (error) {
        assert.equal(error.message, 'Property path of storage not a function');
        done();
      }
    });

    it('throws error if no path parameter provided', function(done) {
      try {
        controller.storeFile(this.user, this.storage, undefined, this.jsonData, function(error, data) {
          done(new Error('Error not thrown by method'));
        });
      } catch (error) {
        assert.equal(error.message, 'Parameter path undefined or null');
        done();
      }
    });

    it('throws error if path parameter not string', function(done) {
      try {
        controller.storeFile(this.user, this.storage, 3, this.jsonData, function(error, data) {
          done(new Error('Error not thrown by method'));
        });
      } catch (error) {
        assert.equal(error.message, 'Parameter path not a string');
        done();
      }
    });

    it('throws error if path parameter contains several periods', function(done) {
      try {
        controller.storeFile(this.user, this.storage, 'h.el.lo', this.jsonData, function(error, data) {
          done(new Error('Error not thrown by method'));
        });
      } catch (error) {
        assert.equal(error.message, 'Parameter path has more than one period');
        done();
      }
    });

    it('throws error if path parameter contains period at end but lacks extension', function(done) {
      try {
        controller.storeFile(this.user, this.storage, 'hello.', this.jsonData, function(error, data) {
          done(new Error('Error not thrown by method'));
        });
      } catch (error) {
        assert.equal(error.message, 'Parameter path lacks extension');
        done();
      }
    });

    it('throws error if path parameter lacks extension', function(done) {
      try {
        controller.storeFile(this.user, this.storage, 'hello', this.jsonData, function(error, data) {
          done(new Error('Error not thrown by method'));
        });
      } catch (error) {
        assert.equal(error.message, 'Parameter path lacks extension');
        done();
      }
    });

    it('throws error if path parameter lacks supported extension', function(done) {
      try {
        controller.storeFile(this.user, this.storage, 'hello', this.jsonData, function(error, data) {
          done(new Error('Error not thrown by method'));
        });
      } catch (error) {
        assert.equal(error.message, 'Parameter path lacks extension');
        done();
      }
    });

    it('throws error if no data parameter provided', function(done) {
      try {
        controller.storeFile(this.user, this.storage, this.jsonPath, undefined, function(error, data) {
          done(new Error('Error not thrown by method'));
        });
      } catch (error) {
        assert.equal(error.message, 'Parameter data undefined or null');
        done();
      }
    });

    it('throws error if data parameter not object or buffer', function(done) {
      try {
        controller.storeFile(this.user, this.storage, this.jsonPath, 3, function(error, data) {
          done(new Error('Error not thrown by method'));
        });
      } catch (error) {
        assert.equal(error.message, 'Parameter data not an object or buffer');
        done();
      }
    });

    it('throws error if jpg path matched with json data', function(done) {
      try {
        controller.storeFile(this.user, this.storage, this.bufferPath, this.jsonData, function(error, data) {
          done(new Error('Error not thrown by method'));
        });
      } catch (error) {
        assert.equal(error.message, 'Parameter extension jpg not provided with binary data');
        done();
      }
    });

    it('throws error if json path matched with buffer data', function(done) {
      try {
        controller.storeFile(this.user, this.storage, this.jsonPath, this.bufferData, function(error, data) {
          done(new Error('Error not thrown by method'));
        });
      } catch (error) {
        assert.equal(error.message, 'Parameter extension json not provided with parseable data');
        done();
      }
    });

    it('throws error if done parameter not function', function(done) {
      try {
        controller.storeFile(this.user, this.storage, this.jsonPath, this.jsonData, 3);
        done(new Error('Error not thrown by method'));
      } catch (error) {
        assert.equal(error.message, 'Parameter done not a function');
        done();
      }
    });

    describe('with json data', function() {
      it('returns no error', function(done) {
        controller.storeFile(this.user, this.storage, this.jsonPath, this.jsonData, function(error, data) {
          done(error);
        });
      });
    });

    describe('with buffer data', function() {
      it('returns no error', function(done) {
        controller.storeFile(this.user, this.storage, this.bufferPath, this.bufferData, function(error, data) {
          done(error);
        });
      });
    });

    describe('with invalid userStorageAuth.storageToken', function() { 
      it('throws unauthorized request error', function(done) {
        var self = this;
        this.userStorageAuth.storageToken = 'xxxxxxxxx';

        this.userStorageAuth.save(function(error) {
          controller.storeFile(self.user, self.storage, self.jsonPath, self.jsonData, function(error) {
            assert.equal(error.message, 'Failed to store file because of unauthorized request to storage');
            done();
          });
        });
      });
    });
  });
});