var UserSourceAuth = require('../../models/user-source-auth');
var Source = require('../../models/source');
var ContentType = require('../../models/contentType');

var contentTypes = [
  new ContentType('checkin', 'checkins'), 
  new ContentType('tip', 'tips'), 
  new ContentType('friend', 'friends')
];

var foursquare = new Source({
  id: 'foursquare',
  name: 'foursquare',
  enabled: true,
  logoGlyphPath: '/images/logos/foursquare-glyph.svg',
  contentTypes: contentTypes,
  host: 'api.foursquare.com',
  apiVersion: '20150712',
  defaultItemsLimit: 250
});

foursquare.itemsPagePath = function(contentType, userSourceAuth, offset) {
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