var winston = require('winston');
var util = require('util');

var customColors = {
  trace: 'white',
  debug: 'green',
  info: 'green',
  warn: 'yellow',
  crit: 'red',
  fatal: 'red'
};

var logger = new(winston.Logger)({
  colors: customColors,
  levels: {
    trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    crit: 4,
    fatal: 5
  },
  transports: [
    new winston.transports.Console({
      level: 'trace',
      colorize: true
    }),
    new winston.transports.File({
      level: 'trace',
      filename: 'logs/app.log',
      colorize: true,
      timestamp: true
    })
  ]
});

module.exports = logger;