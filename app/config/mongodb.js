/**
 * MongoDB configuration
 * @module
 */

var logger = require('app/lib/logger');

if (!process.env.SYNC_SERVER_MONGODB_DATABASE) {
  throw new Error('MongoDB not provided database name');
}

if (!process.env.SYNC_SERVER_MONGODB_HOST) {
  throw new Error('MongoDB failed to find host variable environment');
}

if (!process.env.SYNC_SERVER_MONGODB_PORT) {
  throw new Error('MongoDB port not provided by environment');
}

module.exports = {
  url: 'mongodb://' + process.env.SYNC_SERVER_MONGODB_HOST + ':' + process.env.SYNC_SERVER_MONGODB_PORT + '/' + process.env.SYNC_SERVER_MONGODB_DATABASE
};