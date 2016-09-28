var logger = require('../lib/logger');

module.exports = function(app) {
  app.all('/*', function(req, res, next) {
    logger.info('received request', { 
      path: req.path,
      params: req.params,
      query: req.query
    });
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