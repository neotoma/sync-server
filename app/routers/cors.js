var app = require('app');
var cors = require('cors');
var debug = require('app/lib/debug')('syncServer:cors');

/**
 * Restricts cross-origin HTTP requests for app to given host using CORS
 * @param {string} [host] - Host (e.g. http://example.com) or hosts (comma-delimited). If omitted, all CORS requests enabled.
 */
module.exports = function(host) {
  if (!host) {
    return app.use(cors());
  }

  debug(`CORS support: ${host}`);

  app.use(function(req, res, next) {
    cors({
      allowedHeaders: 'Content-Type',
      credentials: true,
      methods: 'GET,PATCH,PUT,POST,DELETE',
      origin: function(origin, done) {
        if (origin) {
          var whitelisted = (host.split(',').indexOf(origin) !== -1);
          done(whitelisted ? undefined : new Error('Unsupported request origin'), whitelisted);
        } else {
          done(undefined, true);
        }
      }
    })(req, res, function(error) {
      if (error) {
        res.status(401).send(error.message);
      } else {
        next();
      }
    });
  });
};