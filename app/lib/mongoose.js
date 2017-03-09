var _ = require('lodash');
var async = require('async');
var debug = require('app/lib/debug')('syncServer:mongoose');
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
 * Remove collections
 * @param {Array} collections
 * @param {callback} done
 */
mongoose.removeCollections = removeCollections = function(collections, done) {
  if (!collections) {
    return done(new Error('No collections provided'));
  }

  debug.start('removing collections: %s', collections.join(', '));

  async.each(collections, function(collection, done) {
    debug.trace('removing collection: %s', collection);
    mongoose.connection.collections[collection].remove(done);
  }, (error) => {
    if (!error) {
      debug.success('all specified collections removed');
    }

    done(error);
  });
};

/**
 * Remove all collections
 * @param {callback} done
 */
mongoose.removeAllCollections = function(done) {
  debug.start('remove all collections');
  removeCollections(Object.keys(mongoose.connection.collections), done);
};

module.exports = mongoose;