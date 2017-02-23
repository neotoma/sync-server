var cors = require('cors');

/**
 * Restricts cross-origin HTTP requests for app to given host using CORS
 * @param {Object} app - Express app
 * @param {string} host - Host (e.g. example.com)
 */
module.exports = function(app, host) {
  app.use(function(req, res, next) {
    if (!host) { return next(); }

    cors({
      allowedHeaders: 'Content-Type',
      credentials: true,
      methods: 'GET,PUT,POST,DELETE',
      origin: function(origin, done) {
        if (origin) {
          var whitelisted = ([
            'http://' + host,
            'https://' + host
          ].indexOf(origin) !== -1);
          done(whitelisted ? undefined : new Error('Unsupported request origin'), whitelisted);
        } else {
          done(undefined, true);
        }
      }
    })(req, res, next);
  });
};