var request = require('request');

request.statusCodeError = function(statusCode) {
  var error;

  if (statusCode === 401) {
    error = new Error('Failed to make authorized request');
  } else if ([200, 201, 202].indexOf(statusCode) === -1) {
    error = new Error('Failed to make successful request');
  }

  return error;
};

module.exports = request;