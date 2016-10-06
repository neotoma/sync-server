var session = require('./session');

return require('passport.socketio').authorize({
  key: session.key,
  secret: session.secret,
  store: session.store,
  cookieParser: require('cookie-parser')
});