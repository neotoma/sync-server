var logger = require('./logger');
var morgan = require('morgan');

module.exports = function(message) {
  var message = message ? message : 'Processed request';

  var stream = {
    write: function(combinedLog, encoding){
      logger.info(message, { combinedLog: combinedLog });
    }
  };

  return morgan('combined', { stream: stream });
};