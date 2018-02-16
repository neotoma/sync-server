/**
 * Session configuration
 * @module
 */

var logger = require('app/lib/logger'),
  mongoDBConfig = require('./mongodb'),
  MongoStore = require('connect-mongo')(require('express-session'));

try {
  var secret = process.env.SYNC_SERVER_SESSION_SECRET;

  if (!secret) {
    throw new Error('Session failed to find secret variable in environment');
  }

  module.exports = {
    key: 'connect.sid',
    secret: secret,
    store: new MongoStore({
      url: mongoDBConfig.url
    })
  };
} catch (error) {
  logger.fatal('Session failed to find secret variable in environment');
  throw error;
}
