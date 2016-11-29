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
  clientId: process.env.SYNC_SERVER_SOURCES_INSTAGRAM_CLIENT_ID || logger.fatal('Client ID not provided by environment for Instagram config'),
  clientSecret: process.env.SYNC_SERVER_SOURCES_INSTAGRAM_CLIENT_SECRET || logger.fatal('Client secret not provided by environment for Instagram config')
});

instagram.itemsPageUrl = function(contentType, userSourceAuth, pagination) {
  var path = '/v1/users/self/media/recent?access_token=' + userSourceAuth.sourceToken;

  if (typeof pagination.next_max_id !== 'undefined') {
    path = path + '&max_id=' + pagination.next_max_id;
  } else if (pagination.offset !== 0) {
    return null;
  }

  return 'https://' + this.host + path;
}

instagram.itemsPageDataObjets = function(page) {
  return page.data;
};

instagram.itemsPageTotalAvailable = function(page) {
  return null;
};

instagram.itemsPageNextPagination = function(page) {
  var nextPagination;

  if (typeof page.data.pagination !== 'undefined' && typeof page.data.pagination.next_max_id !== 'undefined') {
    nextPagination = {
      next_max_id: page.data.pagination.next_max_id
    };
  }

  return nextPagination;
};

instagram.itemDescription = function(item) {
  var description;

  if (typeof item.data.caption !== 'undefined' && item.data.caption) {
    description = item.data.caption.text;
  }

  return description;
};

module.exports = instagram;