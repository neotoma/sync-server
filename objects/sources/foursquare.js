var UserSourceAuth = require('../../models/userSourceAuth');
var Source = require('../../models/source');
var ContentType = require('../../models/contentType');
var logger = require('../../lib/logger');

var contentTypes = [
  new ContentType({ id: 'checkin' }),
  new ContentType({ id: 'tip' }),
  new ContentType({ id: 'friend' })
];

var foursquare = new Source({
  id: 'foursquare',
  name: 'foursquare',
  enabled: true,
  logoGlyphPath: '/images/logos/foursquare-glyph.svg',
  contentTypes: contentTypes,
  host: 'api.foursquare.com',
  apiVersion: '20150712',
  itemsLimit: 250,
  clientId: process.env.SYNC_SERVER_SOURCES_FOURSQUARE_CLIENT_ID || logger.fatal('Client ID not provided by environment for foursquare config'),
  clientSecret: process.env.SYNC_SERVER_SOURCES_FOURSQUARE_CLIENT_SECRET || logger.fatal('Client secret not provided by environment for foursquare config')
});

foursquare.itemsPageUrl = function(contentType, userSourceAuth, pagination) {
  var offset = (typeof pagination === 'undefined') ? 0 : pagination.offset;
  return 'https://' + this.host + '/v2/users/self/' + contentType.pluralId + '?v=' + this.apiVersion + '&oauth_token=' + userSourceAuth.sourceToken + '&limit=' + this.itemsLimit + '&offset=' + offset;
}

foursquare.itemDescription = function(item) {
  switch(item.contentTypeId) {
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