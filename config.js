module.exports = {
  mongodbURL: process.env.ASHEVILLE_SYNC_MONGODB_URL,
  port: process.env.ASHEVILLE_SYNC_EXPRESS_PORT || 9090,
  session: {
    secret: process.env.ASHEVILLE_SYNC_SESSIONS_SECRET
  },
  storages: {
    dropbox: {
      appKey: process.env.ASHEVILLE_SYNC_STORAGES_DROPBOX_APP_KEY,
      appSecret: process.env.ASHEVILLE_SYNC_STORAGES_DROPBOX_APP_SECRET,
      callbackURL: process.env.ASHEVILLE_SYNC_STORAGES_DROPBOX_CALLBACK_URL
    }
  },
  sources: {
    foursquare: {
      clientID: process.env.ASHEVILLE_SYNC_SOURCES_FOURSQUARE_CLIENT_ID,
      clientSecret: process.env.ASHEVILLE_SYNC_SOURCES_FOURSQUARE_CLIENT_SECRET,
      callbackURL: process.env.ASHEVILLE_SYNC_SOURCES_FOURSQUARE_CALLBACK_URL
    }
  }
}