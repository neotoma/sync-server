var mongoose = require('mongoose');
var logger = require('./logger');
var mongodb = require('./mongodb');

mongoose.Promise = global.Promise;

mongoose.connection.on('error', function(error) {
  logger.error('Mongoose encountered error: %s', error);
});

mongoose.connection.once('open', function() {
  logger.info('Mongoose connected to MongoDB', { url: mongodb.url });
});

mongoose.connect(mongodb.url);

mongoose.transform = function(doc, ret, options) {
  delete ret._id;
  delete ret.__v;

  for (var key in ret) {
    // Convert ID suffixes
    if (key.endsWith('_id')) {
      var newKey = key.slice(0,-3);
      ret[newKey] = ret[key];
      delete ret[key];
      key = newKey;
    }

    // Convert under_scores to camelCase
    var newKey = key.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });

    if (newKey != key) {
      ret[newKey] = ret[key];
      delete ret[key];
    }
  }
};

module.exports = mongoose;