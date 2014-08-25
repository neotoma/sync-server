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

mongoose.transform = function(doc, ret, options) {
  delete ret._id;
  delete ret.__v;

  String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
  };

  for (var key in ret) {
    if (key.endsWith('_id')) {
      var newKey = key.slice(0,-3);
      ret[newKey] = ret[key];
      delete ret[key];
    };
  }
};

module.exports = mongoose;