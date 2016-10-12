var logger = require('../lib/logger');
var cors = require('cors');

var origins = [
  'http://' + process.env.SYNC_WEB_HOST, 
  'https://' + process.env.SYNC_WEB_HOST
];

var corsOptions = {
  allowedHeaders: 'Content-Type',
  credentials: true,
  methods: 'GET,PUT,POST,DELETE',
  origin: function(origin, callback) {
    var whitelisted = (origins.indexOf(origin) !== -1);
    callback(whitelisted ? null : 'Bad Request', whitelisted);
  }
};

module.exports = function(app) {
  app.all('/*', cors(corsOptions), function(req, res, next) {
    logger.info('App received request', { path: req.path, ip: req.ip });
    next();
  });

  require('./sessions')(app);
  require('./storages')(app);
  require('./contactVerificationRequests')(app);

  require('./sources')(app);
  require('./userStorageAuths')(app);
  require('./userSourceAuths')(app); 
  require('./statuses')(app); 
  require('./notificationRequests')(app);  

  require('./resources')(app, [{
    name: 'contactVerificationRequest',
    adminAuthFilter: true
  }, {
    name: 'user',
    adminAuthFilter: true
  }, {
    name: 'notificationRequest',
    adminAuthFilter: true
  }]);
}