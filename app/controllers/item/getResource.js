var async = require('async'),
  debug = require('app/lib/debug')('app:itemController'),
  hasSupportedMediaType = require('app/controllers/item/hasSupportedMediaType'),
  logger = require('app/lib/logger'),
  mime = require('app/lib/mime'),
  request = require('app/lib/request'),
  urlRegex = require('app/lib/urlRegex'),
  validateParams = require('app/lib/validateParams');

/**
 * Callback resource found at URL.
 * @param {string} url - URL of resource with extension that corresponds to a supported media type.
 * @param {module:controllers/item~resourceCallback} done
 */
module.exports = function(url, done) {
  var log = logger.scopedLog();

  var validate = (done) => {
    validateParams([{
      name: 'url', variable: url, required: true, requiredType: 'string', regex: urlRegex
    }], (error) => {
      if (!error && hasSupportedMediaType(url) === false) {
        error = new Error('Parameter url indicates unsupported media type');
      }

      done(error);
    });
  };

  var setupLog = (done) => {
    debug.start('getResource %s', url);

    log = logger.scopedLog({
      url: url
    });

    done();
  };

  var getResource = (done) => {
    var mediaType = mime.lookup(url);
    mediaType = mediaType ? mediaType : 'application/json';

    request({
      url: url,
      headers: {
        'Content-Type': mediaType
      }
    }, function(error, res, body) {
      if (error) {
        return done(error);
      } else if (request.statusCodeError(res.statusCode)) {
        return done(request.statusCodeError(res.statusCode));
      }

      var resource;

      switch (mediaType) {
      case 'image/jpeg':
        resource = new Buffer(body);
        break;
      case 'application/json':
        try {
          resource = JSON.parse(body);
        } catch (error) {
          return done(new Error('Unable to parse resource'));
        }
        break;
      default:
        return done('Unrecognized media type encountered');
      }

      debug.success('getResource (mediaType: %s)', mediaType);
      done(undefined, resource);
    });
  };

  async.waterfall([
    validate, 
    setupLog,
    getResource
  ], function(error, resource) {
    if (error) {
      log('error', 'Item controller failed to get resource', { error: error }); 
    }

    done(error, resource);
  });
};
