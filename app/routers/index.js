var authsRouter = require('app/routers/auths'),
  debug = require('app/lib/debug')('app:routers'),
  cors = require('app/routers/cors'),
  logger = require('app/lib/logger'),
  routeModelResources = require('app/lib/jsonapi/routeModelResources'),
  sessionsRouter = require('app/routers/sessions');

module.exports = function(app) {
  debug('initializing routers');
  cors(app, process.env.SYNC_SERVER_WEB_HOST);
  logger.logRequests(app);
  routeModelResources(app);
  sessionsRouter.routeResources(app);
  authsRouter(app);
};
