var cookieParser = require('cookie-parser');
var passportSocketIO = require('passport.socketio');
var sessionConfig = require('../config/session');

return passportSocketIO.authorize({
  key: sessionConfig.key,
  secret: sessionConfig.secret,
  store: sessionConfig.store,
  cookieParser: cookieParser
});