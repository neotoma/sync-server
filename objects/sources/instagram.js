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
  logo_glyph_path: '/images/logos/instagram-glyph.svg',
  content_types: contentTypes,
  host: 'api.instagram.com',
});

instagram.itemsPagePath = function(contentType, userSourceAuth, pagination) {
  var path = '/v1/users/self/media/recent?access_token=' + userSourceAuth.source_token;

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

instagram.isValidItemJSON = function(itemJSON, contentType) {
  switch (contentType.id) {
    case 'image':
      return (itemJSON.type == 'image');
    case 'video':
      return (itemJSON.type == 'video');
    default:
      return false;
  }
};

module.exports = instagram;