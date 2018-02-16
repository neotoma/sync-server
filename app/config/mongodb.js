/**
 * MongoDB configuration
 * @module
 */

var database = process.env.SYNC_SERVER_MONGODB_DATABASE ? process.env.SYNC_SERVER_MONGODB_DATABASE : 'sync_server';
var host = process.env.SYNC_SERVER_MONGODB_HOST ? process.env.SYNC_SERVER_MONGODB_HOST : '127.0.0.1';
var port = process.env.SYNC_SERVER_MONGODB_PORT ? process.env.SYNC_SERVER_MONGODB_PORT : 27017;

module.exports = {
  url: `mongodb://${host}:${port}/${database}`
};
