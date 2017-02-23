var async = require('async');
var debug = require('debug')('syncServer:test:prepareStoreAll');
var nock = require('../../../nock');
var wh = require('../../../../lib/warehouse');

module.exports = function(user, source, storage, contentType, done) {
  var saveUser = (done) => {
    user.save((error) => {
      debug('saved user %s', user.id);
      done(error);
    });
  };

  var saveSource = (done) => {
    source.save((error) => {
      debug('saved source %s', source.id);
      done(error);
    });
  };

  var saveStorage = (done) => {
    storage.save((error) => {
      debug('saved storage %s', storage.id);
      done(error);
    });
  };

  var saveContentTypes = (done) => {
    if (!contentType) {
      wh.manySaved('contentType', undefined, 3, (error, contentTypes) => {
        source.contentTypes = contentTypes;
        source.save((error) => {
          source.populate('contentTypes', (error) => {
            debug('added %s contentTypes to source %s', contentTypes.length, source.id);
            done(error);
          });
        });
      });
    } else {
      contentType.save((error) => {
        done(error);
      });
    }
  };

  var createUserSourceAuth = (done) => {
    wh.oneSaved('userSourceAuth', {
      user: user.id,
      source: source.id
    }, done);
  };

  var setupSourceNock = (userSourceAuth, done) => {
   if (contentType) {
      nock.getItemPages(source, contentType, userSourceAuth, done);
    } else {
      async.each(source.contentTypes, (contentType, done) => {
        nock.getItemPages(source, contentType, userSourceAuth, done);
      }, done);
    }
  };

  var createUserStorageAuth = (done) => {
    wh.oneSaved('userStorageAuth', {
      user: user.id,
      storage: storage.id
    }, done);
  };

  var setupStorageNock = (userStorageAuth, done) => {
    nock.putItems(source, contentType, storage, userStorageAuth, done);
  };

  async.waterfall([
    saveUser,
    saveSource,
    saveStorage,
    saveContentTypes,
    createUserSourceAuth,
    setupSourceNock,
    createUserStorageAuth,
    setupStorageNock
  ], (error) => {
    debug('prepareStoreAll done');
    done();
  });
};