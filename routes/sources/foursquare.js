module.exports = function(app, properties) {
  var SourceRouter = require('./router');
  var logger = require('../../lib/logger');

  return new SourceRouter(app, {
    source_id: 'foursquare',
    client_id: process.env.ASHEVILLE_SYNC_SOURCES_FOURSQUARE_CLIENT_ID || logger.crit('Client ID not provided by environment for foursquare config'),
    client_secret: process.env.ASHEVILLE_SYNC_SOURCES_FOURSQUARE_CLIENT_SECRET || logger.crit('Client secret not provided by environment for foursquare config')
  });
};