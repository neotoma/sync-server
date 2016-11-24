var async = require('async');
var assert = require('assert');
var sinon = require('sinon');
var Item = require('../../../../models/item');
var wh = require('../../../warehouse');

var verifyForContentType = function(contentType, app, done) {
  wh.itemObjects(contentType, function(error, itemObjects) {
    async.each(itemObjects, function(itemObject, done) {
      Item.findOne({
        sourceItemId: itemObject.id
      }, function(error, item) {
        try {
          assert.notEqual(item.storageVerifiedAt, undefined);

          if (app) {
            assert(app.emit.calledWith('storedItemData', sinon.match({ id: item.id })));
          }

          done(error);
        } catch (error) {
          done(error);
        }
      });
    }, done);
  });
};

module.exports = function(contentType, app, done) {
  if (contentType) {
    verifyForContentType(contentType, app, done);
  } else {
    wh.contentTypes(function(error, contentTypes) {
      async.each(contentTypes, function(contentType, done) {
        verifyForContentType(contentType, app, done);
      }, done);
    });
  }
};