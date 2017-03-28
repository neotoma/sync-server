var cookieParser = require('cookie-parser');
var passportSocketIO = require('passport.socketio');
var sessionConfig = require('app/config/session');

module.exports = passportSocketIO.authorize({
  key: sessionConfig.key,
  secret: sessionConfig.secret,
  store: sessionConfig.store,
  cookieParser: cookieParser
});