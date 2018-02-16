var async = require('async'),
  debug = require('app/lib/debug')('app:itemController'),
  hasSupportedMediaType = require('app/controllers/item/hasSupportedMediaType'),
  logger = require('app/lib/logger'),
  mime = require('app/lib/mime'),
  request = require('app/lib/request'),
  UserStorageAuth = require('app/models/userStorageAuth'),
  validateParams = require('app/lib/validateParams');

/**
 * Store file to storage on behalf of user.
 * @param {User} user - User object.
 * @param {Object} storage - Storage object.
 * @param {string} path - Path to store file on storage.
 * @param {Object} data - Object that represents data for file.
 * @param {function} done - Error-first callback function with object representing HTTP response body from storage request as second parameter.
 */
module.exports = function(user, storage, path, data, done) {
  var log = logger.scopedLog();

  var validate = (done) => {
    validateParams([{
      name: 'user', variable: user, required: true, requiredProperties: ['id']
    }, {
      name: 'storage', variable: storage, required: true, requiredProperties: ['id', 'host']
    }, {
      name: 'path', variable: path, required: true, requiredType: 'string'
    }, {
      name: 'data', variable: data, required: true, requiredType: ['buffer', 'object']
    }, {
      name: 'done', variable: done, required: true, requiredType: 'function'
    }], (error) => {
      if (!error) {
        var mediaType = mime.lookup(path);

        if (mediaType === 'image/jpeg' && !(data instanceof Buffer)) {
          error = new Error('Path parameter with jpg extension not provided with binary data');
        } else if (mediaType === 'application/json' && (data instanceof Buffer)) {
          error = new Error('Path parameter with json extension not provided with parseable data');
        } else if (hasSupportedMediaType(path) === false) {
          error = new Error('Parameter path extension indicates unsupported media type');
        }
      }

      done(error);
    });
  };

  var prepareData = (done) => {
    debug.start('storeFile (path: %s)', path);

    if (!(data instanceof Buffer)) {
      data = JSON.stringify(data, null, 2);
    }

    done();
  };

  var setupLog = (done) => {
    log = logger.scopedLog({
      path: path,
      storage: storage.id,
      user: user.id
    });

    done();
  };

  var findUserStorageAuth = (done) => {
    UserStorageAuth.findOne({
      storage: storage.id,
      user: user.id
    }, (error, userStorageAuth) => {
      if (!error && !userStorageAuth) {
        error = new Error('Failed to retrieve userStorageAuth');
      }

      done(error, userStorageAuth);
    });
  };

  var storeFile = (userStorageAuth, done) => {
    var options = {
      body: data,
      headers: storage.headers(path, userStorageAuth),
      url: storage.itemPutUrl(path, userStorageAuth)
    };

    debug('storeFile:options %o', options);

    request.post(options, (error, res, body) => {
      if (!error) {
        error = request.statusCodeError(res.statusCode);
      }

      if (!error) {
        body = JSON.parse(body);
      }
      
      debug('storeFile body %o, error %o', body, error);

      done(error, body);
    });
  };

  async.waterfall([
    validate,
    prepareData,
    setupLog,
    findUserStorageAuth,
    storeFile
  ], (error, responseBody) => {
    if (error) {
      log('error', 'Item controller failed to store file', { error: error.message, responseBody: responseBody }); 
    }

    done(error, responseBody);
  });
};
