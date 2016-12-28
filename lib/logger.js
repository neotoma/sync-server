var util = require('util');
var winston = require('winston');

var logger = new(winston.Logger)({
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
  },
  transports: [
    new winston.transports.File({
      level: 'trace',
      filename: __dirname + '/../app.log',
      timestamp: true
    })
  ]
});

logger.scopedLog = function(defaultMeta) {
  var defaultMeta = defaultMeta ? defaultMeta : {};

  return function(level, event, meta) {
    logger.log(level, event, Object.assign(meta ? meta : {}, defaultMeta));
  };
};

if (process.env.SYNC_SERVER_ENV !== 'test' || process.env.SYNC_SERVER_FORCE_LOG_CONSOLE) {
  logger.add(winston.transports.Console, {
    level: (process.env.SYNC_SERVER_ENV === 'development') ? 'trace' : 'info',
    colorize: true
  });
}

module.exports = logger;

if (module.parent.filename.indexOf('/mongodb.js') === -1) {
  require('winston-mongodb').MongoDB;

  logger.add(winston.transports.MongoDB, {
    db: require('./mongodb').url,
    level: 'trace',
    timestamp: true
  });
}

module.exports = logger;

if (process.env.SYNC_SERVER_ENV !== 'development') {
  logger.add(require('./winston-mailer-transport'), {
    level: 'warn'
  });
}

module.exports = logger;