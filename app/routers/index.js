module.exports = function() {
  require('app/routers/cors')(process.env.SYNC_SERVER_WEB_HOST);
  require('app/lib/logger').logRequests();
  require('app/lib/jsonapi').routeModelResources();
  require('app/routers/sessions').routeResources();
  require('app/routers/auths');
};