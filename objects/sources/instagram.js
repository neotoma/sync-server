var UserSourceAuth = require('../../models/user-source-auth');
var Source = require('../../models/source');
var ContentType = require('../../models/contentType');
var logger = require('../../lib/logger');

var contentTypes = [
  new ContentType('image', 'images'),
  new ContentType('video', 'videos'),
];

var instagram = new Source({
  id: 'instagram',
  name: 'Instagram',
  enabled: true,
  logoGlyphPath: '/images/logos/instagram-glyph.svg',
  contentTypes: contentTypes,
  host: 'api.instagram.com',
  clientId: process.env.ASHEVILLE_SYNC_SOURCES_INSTAGRAM_CLIENT_ID || logger.crit('Client ID not provided by environment for Instagram config'),
  clientSecret: process.env.ASHEVILLE_SYNC_SOURCES_INSTAGRAM_CLIENT_SECRET || logger.crit('Client secret not provided by environment for Instagram config')
});

instagram.itemsPagePath = function(contentType, userSourceAuth) {
  return '/v1/users/self/media/recent?access_token=' + userSourceAuth.source_token;
}

instagram.itemDescription = function(item) {
  switch(item.content_type_id) {
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

module.exports = instagram;