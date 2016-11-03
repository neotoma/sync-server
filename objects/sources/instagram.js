var UserSourceAuth = require('../../models/userSourceAuth');
var Source = require('../../models/source');
var ContentType = require('../../models/contentType');
var logger = require('../../lib/logger');

var contentTypes = [
  new ContentType({ id: 'image' }),
  new ContentType({ id: 'video' }),
];

var instagram = new Source({
  id: 'instagram',
  name: 'Instagram',
  enabled: true,
  logoGlyphPath: '/images/logos/instagram-glyph.svg',
  contentTypes: contentTypes,
  host: 'api.instagram.com',
  clientId: process.env.SYNC_SOURCES_INSTAGRAM_CLIENT_ID || logger.fatal('Client ID not provided by environment for Instagram config'),
  clientSecret: process.env.SYNC_SOURCES_INSTAGRAM_CLIENT_SECRET || logger.fatal('Client secret not provided by environment for Instagram config')
});

instagram.itemsPagePath = function(contentType, userSourceAuth, pagination) {
  var path = '/v1/users/self/media/recent?access_token=' + userSourceAuth.sourceToken;

  if (typeof pagination.next_max_id !== 'undefined') {
    path = path + '&max_id=' + pagination.next_max_id;
  } else if (pagination.offset !== 0) {
    return null;
  }

  return path;
}

instagram.itemDescription = function(item) {
  var description;

  if (typeof item.data.caption !== 'undefined' && item.data.caption) {
    description = item.data.caption.text;
  }

  return description;
};

instagram.validItemType = function(type, contentType) {
  switch (contentType.id) {
    case 'image':
      return (type === 'image');
    case 'video':
      return (type === 'video');
    default:
      return false;
  }
};

module.exports = instagram;