var logger = require('./logger');
var MongoStore = require('connect-mongo')(require('express-session'));

try {
  var secret = process.env.SYNC_SERVER_SESSION_SECRET;

  if (!secret) {
    throw new Error('Session failed to find secret variable in environment');
  }

  module.exports = {
    key: 'connect.sid',
    secret: secret,
    store: new MongoStore({
      url: require('./mongodb').url
    })
  };
} catch (error) {
  logger.fatal('Session failed to find secret variable in environment');
  throw error;
}