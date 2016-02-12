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
  require('./sources')(app);
  require('./user_storage_auths')(app);
  require('./user_source_auths')(app);
  require('./statuses')(app);
  require('./notificationRequests')(app);
}