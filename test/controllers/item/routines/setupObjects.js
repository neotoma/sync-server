var async = require('async');
var nock = require('../../../nock');
var UserSourceAuthFactory = require('../../../factory')('userSourceAuth');
var UserStorageAuthFactory = require('../../../factory')('userStorageAuth');

module.exports = function(user, source, storage, contentType, done) {
  var saveUser = function(done) {
    user.save(function(error) {
      done(error);
    });
  };

  var createUserSourceAuth = function(done) {
    UserSourceAuthFactory.create(done, {
      userId: user.id,
      sourceId: source.id
    });
  };

  var setupSourceNock = function(userSourceAuth, done) {
    if (contentType) {
      nock.getContentTypeItemPages(source, contentType, userSourceAuth, done);
    } else {
      nock.getAllItemPages(source, userSourceAuth, done);
    }
  };

  var createUserStorageAuth = function(done) {
    UserStorageAuthFactory.create(done, {
      userId: user.id,
      storageId: storage.id
    });
  };

  var setupStorageNock = function(userStorageAuth, done) {
    if (contentType) {
      nock.storeContentTypeItems(contentType, userStorageAuth, storage, done);
    } else {
      nock.storeAllItems(userStorageAuth, storage, done);
    }
  };

  async.waterfall([
    saveUser,
    createUserSourceAuth,
    setupSourceNock,
    createUserStorageAuth,
    setupStorageNock
  ], done);
};