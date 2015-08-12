var UserSourceAuth = require('../../models/user-source-auth');
var Source = require('../../models/source');
var ContentType = require('../../models/contentType');
var logger = require('../../lib/logger');

var contentTypes = [];

var twitter = new Source({
  id: 'twitter',
  name: 'Twitter',
  enabled: true,
  logo_glyph_path: '/images/logos/twitter-glyph.svg',
  content_types: contentTypes,
  host: 'api.twitter.com'
});

twitter.itemsPagePath = function(contentType, userSourceAuth) {
  return '/v1/users/self/media/recent?access_token=' + userSourceAuth.source_token;
}

twitter.itemDescription = function(item) {
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

module.exports = twitter;