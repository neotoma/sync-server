var logger = require('./logger'),
  morgan = require('morgan');

module.exports = function(message) {
  message = message ? message : 'Processed request';

  var stream = {
    write: function(combinedLog){
      logger.trace(message, { combinedLog: combinedLog });
    }
  };

  return morgan('combined', { stream: stream });
};
