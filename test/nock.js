var async = require('async');
var nock = require('nock');
var url = require('url');
var wh = require('./warehouse');

nock.get = function(requestUrl, responseBody, responseStatus) {
  var urlObject = url.parse(requestUrl);
  var hostname = urlObject.protocol + '//' + urlObject.host;
  var status = responseStatus ? responseStatus : 200;
  return nock(hostname).get(urlObject.path).reply(responseStatus, responseBody);
};

nock.putStorage = function(storage, userStorageAuth, statusCode) {
  var scope = nock('https://' + storage.host);
  statusCode = statusCode ? statusCode : 200;

  scope.put(/.+/).query({
    access_token: userStorageAuth.storageToken
  }).reply(statusCode, {
    bytes: wh.bytes
  });

  return scope;
};

nock.getAllItemPages = function(source, userSourceAuth, done) {
  var self = this;

  wh.contentTypes(function(error, contentTypes) {
    async.each(contentTypes, function(contentType, done) {
      self.getContentTypeItemPages(source, contentType, userSourceAuth, done);
    }, done);
  });
};

nock.getContentTypeItemPages = function(source, contentType, userSourceAuth, done) {
  var offset = 0;

  wh.itemPages(contentType, function(error, pages) {
    async.each(pages, function(page, done) {
      nock.get(source.itemsPageUrl(contentType, userSourceAuth, { offset: offset }), page, 200);
      offset = offset + page.response[contentType.pluralId].items.length
      done();
    }, done);
  });
};

nock.storeAllItems = function(userStorageAuth, storage, done) {
  var self = this;

  wh.contentTypes(function(error, contentTypes) {
    async.each(contentTypes, function(contentType, done) {
      self.storeContentTypeItems(contentType, userStorageAuth, storage, done);
    }, done);
  });
};

nock.storeContentTypeItems = function(contentType, userStorageAuth, storage, done) {
  var self = this;

  wh.itemObjects(contentType, function(error, itemObjects) {
    itemObjects.forEach(function(itemObject) {
      self.putStorage(storage, userStorageAuth);
    });

    done();
  });
};

module.exports = nock;