/**
 * Logger
 * @module
 */

var mongoDBConfig = require('app/config/mongodb'),
  winston = require('winston'),
  winstonMailerTransport = require('./winstonMailerTransport');

require('winston-mongodb').MongoDB;

module.exports = new(winston.Logger)({
  colors: {
    trace: 'white',
    info: 'green',
    warn: 'yellow',
    milestone: 'cyan',
    error: 'red',
    fatal: 'red'
  },
  levels: {
    trace: 5,
    info: 4,
    warn: 3,
    milestone: 2,
    error: 1,
    fatal: 0
  }
});

/**
 * Return function for logging event using default meta data
 * Useful for instrumenting repeat logging within a given context without declaring repeat meta data redundantly
 * Meta data passed into returned function will take precedence over default meta data
 * @param {Object} defaultMeta - Default meta data
 * @returns {function} log function that takes standard Wiston log() params level, event and meta
 */
module.exports.scopedLog = function(defaultMeta) {
  return function(level, event, meta) {
    module.exports.log(level, event, Object.assign(defaultMeta ? defaultMeta : {}, meta ? meta : {}));
  };
};

/**
 * Establishes logging of all requests for app
 */
module.exports.logRequests = function(app) {
  app.use((req, res, next) => {
    this.trace('App received request', { 
      ip: req.ip,
      method: req.method,
      path: req.path
    });

    next();
  });
};

if (module.parent.filename.indexOf('/mongodb.js') === -1) {
  module.exports.add(winston.transports.MongoDB, {
    db: mongoDBConfig.url,
    level: 'trace',
    timestamp: true
  });
}

if (process.env.SYNC_SERVER_LOGGER_MAILER_LEVEL) {
  module.exports.add(winstonMailerTransport, {
    level: process.env.SYNC_SERVER_LOGGER_MAILER_LEVEL
  });
}

if (process.env.SYNC_SERVER_LOGGER_FILE_PATH) {
  module.exports.add(winston.transports.File, {
    level: 'trace',
    filename: process.env.SYNC_SERVER_LOGGER_FILE_PATH,
    timestamp: true
  });
}
