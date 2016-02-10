var UserSourceAuth = require('../../models/user_source_auth');
var Source = require('../../models/source');
var ContentType = require('../../models/content_type');
var logger = require('../../lib/logger');

var contentTypes = [];

var twitter = new Source({
  id: 'twitter',
  name: 'Twitter',
  enabled: true,
  logoGlyphPath: '/images/logos/twitter-glyph.svg',
  contentTypes: contentTypes,
  host: 'api.twitter.com',
  consumerKey: process.env.SYNC_SOURCES_TWITTER_CONSUMER_KEY || logger.fatal('Client ID not provided by environment for Twitter config'),
  consumerSecret: process.env.SYNC_SOURCES_TWITTER_CONSUMER_SECRET || logger.fatal('Client secret not provided by environment for Twitter config'),
  host: 'api.twitter.com'
});

twitter.itemsPagePath = function(contentType, userSourceAuth) {
  return '/v1/users/self/media/recent?access_token=' + userSourceAuth.sourceToken;
}

twitter.itemDescription = function(item) {
  switch(item.contentTypeId) {
    case 'image':
    case 'video':
      if (typeof item.data.caption != 'undefined') {
        var caption = item.data.caption.text;
      }

      return caption;
      break;
    default:
      return;
  }
};

module.exports = twitter;