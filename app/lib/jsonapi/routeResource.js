/**
 * Routes requests to resource callback for app, method, path and middleware
 * @param {Object} app - Express app
 * @param {string} method - HTTP method (lowercase, e.g "get")
 * @param {string} path - Path to resource
 * @param {Object} middleware - Dictionary of middleware boolean or function values to use for route
 * @param {function} done - Express route callback expecting req and res as parameters
 */
module.exports = function(app, method, path, middleware, done) {
  var requireAuthentication = (req, res, next) => {
    if (middleware && middleware.requireAuthentication) {
      app.requireAuthentication(req, res, next);
    } else {
      next();
    }
  };

  var requireAdminAuthentication = (req, res, next) => {
    if (middleware && middleware.requireAdminAuthentication) {
      app.requireAdminAuthentication(req, res, next);
    } else {
      next();
    }
  };

  var validateRequestBody = (req, res, next) => {
    if (middleware && middleware.validateRequestBody && typeof middleware.validateRequestBody === 'function') {
      middleware.validateRequestBody(req, res, next);
    } else if (middleware && middleware.validateRequestBody) {
      validateRequestBody()(req, res, next);
    } else {
      next();
    }
  };

  app[method](path, requireAuthentication, requireAdminAuthentication, validateRequestBody, done);
};
