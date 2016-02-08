var UserSourceAuth = require('../../models/user-source-auth');
var Source = require('../../models/source');
var ContentType = require('../../models/contentType');
var logger = require('../../lib/logger');

var contentTypes = [
  new ContentType('checkin', 'checkins'), 
  new ContentType('tip', 'tips'), 
  new ContentType('friend', 'friends')
];

var foursquare = new Source({
  id: 'foursquare',
  name: 'foursquare',
  enabled: true,
  logo_glyph_path: '/images/logos/foursquare-glyph.svg',
  content_types: contentTypes,
  host: 'api.foursquare.com',
  api_version: '20150712',
  default_items_limit: 250,
  client_id: process.env.SYNC_SOURCES_FOURSQUARE_CLIENT_ID || logger.fatal('Client ID not provided by environment for foursquare config'),
  client_secret: process.env.SYNC_SOURCES_FOURSQUARE_CLIENT_SECRET || logger.fatal('Client secret not provided by environment for foursquare config')
});

foursquare.itemsPagePath = function(contentType, userSourceAuth, pagination) {
  var offset = (typeof pagination === 'undefined') ? 0 : pagination.offset;
  return '/v2/users/self/' + contentType.plural_id + '?v=' + this.apiVersion + '&oauth_token=' + userSourceAuth.source_token + '&limit=' + this.defaultItemsLimit + '&offset=' + offset;
}

foursquare.itemDescription = function(item) {
  switch(item.content_type_id) {
    case 'friend':
      var name = item.data.firstName;

      if (item.data.lastName) {
        name = name + ' ' + item.data.lastName;
      }

      return name;
      break;
    case 'checkin':
      if (item.data.venue) {
        return item.data.venue.name;
      }

      break;
    case 'tip':
      if (item.data.venue) {
        return item.data.venue.name;
      }

      break;
    default:
      return;
  }
};

module.exports = foursquare;