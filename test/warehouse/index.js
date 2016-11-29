var async = require('async');
var ContentType = require('../../models/contentType');
var logger = require('../../lib/logger');
var fs = require('fs');

var jpegData = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);

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

var warehouse = {
  // JSON
  jsonUrl: 'http://example.com/foo.json',
  jsonPath: '/foo.json',
  jsonData: { foo: 'bar' },

  // JPEG
  jpegUrl: 'http://example.com/foo.jpg',
  jpegPath: '/foo.jpg',
  jpegData: jpegData,

  // Misc
  bytes: 1234,
  pagination: { offset: 0 },

  // Functions
  emptyDone: function(error) {},

  swh: subwarehouses,

  // Objects
  contactVerificationRequest: subwarehouses.contactVerificationRequest.one(),
  contentType: subwarehouses.contentType.one(),
  item: subwarehouses.item.one(),
  notificationRequest: subwarehouses.notificationRequest.one(),
  source: subwarehouses.source.one(),
  status: subwarehouses.status.one(),
  storage: subwarehouses.storage.one(),
  user: subwarehouses.user.one(),
  userSourceAuth: subwarehouses.userSourceAuth.one(),
  userStorageAuth: subwarehouses.userStorageAuth.one(),

  itemPages: function(contentType, done) {
    var dir = __dirname + '/../pages/items/' + contentType.id;

    fs.readdir(dir, function(error, fileNames) {
      async.map(fileNames, function(fileName, done) {
        done(undefined, require(dir + '/' + fileName));
      }, done);
    });
  },

  contentTypes: function(done) {
    var self = this;
    var dir = __dirname + '/../pages/items';

    fs.readdir(dir, function(error, folderNames) {
      async.map(folderNames, function(folderName, done) {
        done(undefined, new ContentType({ id: folderName }));
      }, done);
    });
  },

  itemObjects: function(contentType, done) {
    var itemObjects = new Array();
    this.itemPages(contentType, function(error, pages) {
      async.each(pages, function(page, done) {
        page.response[contentType.pluralId].items.forEach(function(item) {
          itemObjects.push(item);
        });
        done();
      }, function(error) {
        done(error, itemObjects);
      });
    });
  }
};

module.exports = warehouse;