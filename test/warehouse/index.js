var async = require('async');
var logger = require('../../lib/logger');

// Model sub-warehouses
var subwarehouses = {
  contactVerificationRequest: require('./contactVerificationRequest'),
  contentType: require('./contentType'),
  item: require('./item'),
  notificationRequest: require('./notificationRequest'),
  source: require('./source'),
  status: require('./status'),
  storage: require('./storage'),
  user: require('./user'),
  userSourceAuth: require('./userSourceAuth'),
  userStorageAuth: require('./userStorageAuth')
};

module.exports = {
  // JSON
  jsonUrl: 'http://myhost/foo.json',
  jsonPath: 'foo.json',
  jsonData: { foo: 'bar' },

  // JPEG
  jpegUrl: 'http://myhost/foo.jpg',
  jpegPath: 'foo.jpg',
  jpegData: Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]),

  // Functions
  emptyDone: function(error) {},

  swh: subwarehouses,

  // Objects
  contactVerificationRequest: subwarehouses.contactVerificationRequest.one,
  contentType: subwarehouses.contentType.one,
  item: subwarehouses.item.one,
  notificationRequest: subwarehouses.notificationRequest.one,
  source: subwarehouses.source.one,
  status: subwarehouses.status.one,
  storage: subwarehouses.storage.one,
  user: subwarehouses.user.one,
  userSourceAuth: subwarehouses.userSourceAuth.one,
  userStorageAuth: subwarehouses.userStorageAuth.one
};