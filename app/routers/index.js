module.exports = function(app) {
  require('./cors')(app, process.env.SYNC_SERVER_WEB_HOST);
  require('app/lib/logger').req(app);
  require('app/lib/jsonapi').routeModelResources(app);
  require('./sessions')(app);
  require('./auths')(app, require('app/models/source'));
  require('./auths')(app, require('app/models/storage'));
};