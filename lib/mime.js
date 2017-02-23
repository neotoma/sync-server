var debug = require('debug')('syncServer:mime');
var mime = require('mime-types');
var url = require('url');

var lookup = mime.lookup;

mime.lookup = function(path) {
  return lookup.call(mime, url.parse(path).pathname);
};

module.exports = mime;