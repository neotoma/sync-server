var allowed = require('app/lib/jsonapi/allowed'),
  routeResource = require('app/lib/jsonapi/routeResource'),
  validateRequestBody = require('app/lib/jsonapi/validateRequestBody');

/**
 * Routes requests to resource callback for app, model, method and path
 * @param {Object} app - Express app
 * @param {model} model - Mongoose model
 * @param {string} method - HTTP method (lowercase, e.g "get")
 * @param {string} path - Path to resource
 * @param {function} done - Express route callback expecting req and res as parameters
 */
module.exports = function(app, model, method, path, done) {
  if (!model.jsonapi || !model.jsonapi[method]) { return; }

  var validateRequestBodyFlag = false;

  if (['patch', 'post'].indexOf(method) !== -1) {
    validateRequestBodyFlag = validateRequestBody(model);
  }

  var middleware = {
    requireAuthentication: (['public'].indexOf(allowed(model, method)) === -1),
    requireAdminAuthentication: (['public', 'user'].indexOf(allowed(model, method)) === -1),
    validateRequestBody: validateRequestBodyFlag
  };

  routeResource(app, method, path, middleware, done);
};
