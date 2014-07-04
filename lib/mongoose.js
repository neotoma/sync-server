var mongoose = require('mongoose');
var mongodb = require('./mongodb');
var logger = require('./logger');

mongoose.connection.on('error', function(error) {
  logger.error('mongoose failed to connect: %s', error);
});

mongoose.connection.once('open', function() {
  logger.info('mongoose connected', { url: mongodb.url });
});

mongoose.connect(mongodb.url);

module.exports = mongoose;