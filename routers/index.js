module.exports = function(app) {
  require('./cors')(app, process.env.SYNC_SERVER_WEB_HOST);
  require('../lib/logger').req(app);
  require('../lib/jsonapi').routeModelResources(app);
  require('./sessions')(app);
  require('./auths')(app, require('../models/source'));
  require('./auths')(app, require('../models/storage'));
}