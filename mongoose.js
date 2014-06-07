module.exports = function(app) {
  var mongoose = require('mongoose');
  var logger = require('./logger');

  mongoose.connection.on('error', function(error) {
    logger.error('mongoose failed to connect: %s', error);
  });

  mongoose.connection.once('open', function() {
    logger.info('mongoose connected', { url: app.config.mongodb.url });
  });

  mongoose.connect(app.config.mongodb.url);

  return mongoose;
}