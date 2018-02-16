var _ = require('app/lib/lodash'),
  debug = require('app/lib/debug')('app:jsonapi'),
  sendError = require('app/lib/jsonapi/sendError');

/**
 * Returns Express route middleware that validates request body against JSON API specification and URL for optional model
 * @param {Object} model - Mongoose model (optional)
 */
module.exports = function(model) {
  return (req, res, next) => {
    var errors = [];

    debug('req.body %o', req.body);

    if (typeof req.body.data === 'undefined') {
      errors.push(new Error('Data value not provided top-level in body of request'));
    } else {
      if (typeof req.body.data.attributes === 'undefined') {
        errors.push(new Error('Attributes value not provided within data value of request'));
      }

      if (typeof req.body.data.type === 'undefined') {
        errors.push(new Error('Type value not provided within data value of request'));
      } else if (model && req.body.data.type !== _.kebabCase(model.modelType())) {
        errors.push(new Error('Type value provided within data value of request does not match type indicated by URL'));
      }

      if (req.params.id && !req.body.data.id) {
        errors.push(new Error('ID value not provided within data value of request'));
      } else if (req.params.id && req.body.data.id !== req.params.id) {
        errors.push(new Error('ID value provided within data value of request does not match ID indicated by URL'));
      }
    }

    if (errors.length > 0) {
      var error = new Error('Failed to validate request body');
      error.errors = errors;
      sendError(res, error, 400);
    } else {
      next();
    }
  };
};
