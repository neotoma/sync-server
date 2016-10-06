var logger = require('./logger');

var envDatabases = {
  development: 'sync_dev',
  test: 'sync_test',
  production: 'sync_prod'
};

try {
  var env = process.env.NODE_ENV;

  if (!env) {
    throw new Error('MongoDB not provided environment');
  }

  if (!envDatabases[env]) {
    throw new Error('MongoDB failed to determine database for environment ' + env);
  }

  if (!process.env.SYNC_MONGODB_HOST) {
    throw new Error('MongoDB failed to find host variable in environment');
  }

  if (!process.env.SYNC_MONGODB_PORT) {
    throw new Error('MongoDB port not provided by environment');
  }

  module.exports = {
    url: 'mongodb://' + process.env.SYNC_MONGODB_HOST + ':' + process.env.SYNC_MONGODB_PORT + '/' + envDatabases[env]
  };
} catch(error) {
  logger.fatal(error.message);
  throw error;
}