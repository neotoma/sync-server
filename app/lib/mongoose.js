var _ = require('lodash');
var async = require('async');
var debug = require('debug')('syncServer:mongoose');
var mongoose = require('mongoose');
var logger = require('./logger');
var mongoDBConfig = require('app/config/mongodb');

mongoose.Promise = global.Promise;

mongoose.connection.on('error', function(error) {
  logger.error('Mongoose encountered an error: %s', error);
});

mongoose.connection.once('open', function() {
  logger.info('Mongoose connected to MongoDB', { url: mongoDBConfig.url });
});

mongoose.connect(mongoDBConfig.url);

mongoose.transform = function(doc, ret, options) {
  delete ret._id;
  delete ret.__v;

  for (var key in ret) {
    // Convert ID suffixes
    if (_.endsWith(key, '_id')) {
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

/**
 * Remove all collections
 * @param {callback} done
 */
mongoose.removeCollections = function(done) {
  async.each(Object.keys(mongoose.connection.collections), function(key, done) {
    mongoose.connection.collections[key].remove(done);
  }, (error) => {
    if (!error) {
      debug('All Mongoose database collections cleared');
    }

    done(error);
  });
};

module.exports = mongoose;