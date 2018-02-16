var sendResponseDocument = require('app/lib/jsonapi/sendResponseDocument');

/**
 * Sends response document with error and status code
 * @param {Object} res – Express response object
 * @param {Error} error - Error object (optional) with optional errors property
 * @param {number} [status=500] - HTTP status code
 */
module.exports = function(res, error, status) {
  if (error) {
    var errors = error.errors;

    if (!errors) {
      errors = new Array(error);
    }

    // Convert object of errors to array if needed
    if (typeof errors === 'object' && !Array.isArray(errors)) {
      errors = Object.keys(errors).map(function(key) {
        return errors[key];
      });
    }

    errors = errors.map(function(error) {
      return {
        title: error.message
      };
    });
  }

  if (!status) {
    status = 500;
  }

  sendResponseDocument(res, null, null, errors, status);
};
