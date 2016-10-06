var logger = require('../lib/logger');

module.exports = function(app) {
  app.all('/*', function(req, res, next) {
    logger.info('App received request', { path: req.path, ip: req.ip });
    res.header('Access-Control-Allow-Origin', 'https://' + process.env.SYNC_WEB_HOST);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true');
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