/**
 * Customized request module
 * @module
 */

var debug = require('debug')('syncServer:request');
var request = require('request');

request.statusCodeError = function(statusCode) {
  var error;
  debug('statusCode', statusCode);

  if ([200, 201, 202].indexOf(statusCode) === -1) {
    error = new Error(`Failed to make successful request. HTTP status code: ${statusCode}`);
  }

  return error;
};

module.exports = request;