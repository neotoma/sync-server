var winston = require('winston');
var util = require('util');
require('winston-mongodb').MongoDB;

var customColors = {
  trace: 'white',
  info: 'green',
  warn: 'yellow',
  error: 'red',
  fatal: 'red'
};

var logger = new(winston.Logger)({
  colors: customColors,
  levels: {
    trace: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4
  },
  transports: [
    new winston.transports.Console({
      level: 'trace',
      colorize: true
    }),
    new winston.transports.File({
      level: 'trace',
      filename: 'logs/app.log',
      timestamp: true
    }),
    new winston.transports.MongoDB({
      level: 'trace',
      db: require('../lib/mongodb').url,
      timestamp: true
    })
  ]
});

module.exports = logger;