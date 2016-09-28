var mongodb = require('../lib/mongodb')(true);
var util = require('util');
var winston = require('winston');
require('winston-mongodb').MongoDB;

if (!mongodb.url) {
  throw new Error('failed to determine mongodb url for logger. verify env variables');
}

var logger = new(winston.Logger)({
  colors: {
    trace: 'white',
    info: 'green',
    warn: 'yellow',
    error: 'red',
    fatal: 'red'
  },
  levels: {
    trace: 5,
    info: 4,
    warn: 3,
    error: 1,
    fatal: 0
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
      db: mongodb.url,
      timestamp: true
    })
  ]
});

module.exports = logger;