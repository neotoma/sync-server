var logger = require('./logger');

if (process.env.ASHEVILLE_SYNC_HOST) {
  var dropboxCallbackURL = process.env.ASHEVILLE_SYNC_HOST + '/storages/dropbox/auth-callback'
  var foursquareCallbackURL = process.env.ASHEVILLE_SYNC_HOST + '/sources/foursquare/auth-callback'
}

var config = {
  port: process.env.ASHEVILLE_SYNC_EXPRESS_PORT || 9090,
  mongodb: {
    db:   'asheville',
    host: process.env.ASHEVILLE_SYNC_MONGODB_HOST || logger.crit('MongoDB host not provided by environment for config'),
    port: process.env.ASHEVILLE_SYNC_MONGODB_PORT || logger.crit('MongoDB port not provided by environment for config')
  },
  session: {
    secret: process.env.ASHEVILLE_SYNC_SESSIONS_SECRET || logger.crit('Sessions secret not provided by environment for config')
  },
  storages: {
    dropbox: {
      appKey: process.env.ASHEVILLE_SYNC_STORAGES_DROPBOX_APP_KEY || logger.crit('Dropbox app key not provided by environment for config'),
      appSecret: process.env.ASHEVILLE_SYNC_STORAGES_DROPBOX_APP_SECRET || logger.crit('Dropbox app secret not provided by environment for config'),
      callbackURL: dropboxCallbackURL || logger.crit('Dropbox callback URL could not be set because host not provided by environment for config')
    }
  },
  sources: {
    foursquare: {
      clientID: process.env.ASHEVILLE_SYNC_SOURCES_FOURSQUARE_CLIENT_ID || logger.crit('Foursquare client ID not provided by environment for config'),
      clientSecret: process.env.ASHEVILLE_SYNC_SOURCES_FOURSQUARE_CLIENT_SECRET || logger.crit('Foursquare client secret not provided by environment for config'),
      callbackURL: foursquareCallbackURL || logger.crit('Foursquare callback URL not provided by environment for config')
    }
  }
}

config.mongodb.url = config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.db;

module.exports = config;