var debug = require('app/lib/debug')('app:itemController'),
  mime = require('app/lib/mime'),
  Url = require('url'),
  validateParams = require('app/lib/validateParams');

/**
 * Return whether URL with extension indicates media type supported by controller operations.
 * @param {string} url - URL
 * @returns {boolean|undefined} Whether media type supported by controller operations
 */
module.exports = function(url) {
  validateParams([{
    name: 'url', variable: url, required: true, requiredType: 'string'
  }]);

  var pathname = Url.parse(url).pathname;
  var lastSegment = (pathname.lastIndexOf('/') !== -1) ? pathname.substr(pathname.lastIndexOf('/') + 1) : pathname;

  if (lastSegment.indexOf('.') === -1) {
    return;
  }

  debug('hasSupportedMediaType url %s, mime %s', lastSegment, mime.lookup(lastSegment));

  return (['image/jpeg', 'application/json'].indexOf(mime.lookup(lastSegment)) !== -1);
};
