module.exports = function() {
  require('./cors')(process.env.SYNC_SERVER_WEB_HOST);
  require('app/lib/logger').logRequests();
  require('app/lib/jsonapi').routeModelResources();
  require('./sessions').routeResources();
  require('./auths')(require('app/models/source'));
  require('./auths')(require('app/models/storage'));
};