//var app = require('app');
var assert = require('assert');
var async = require('async');
var debug = require('debug')('syncServer:test:verifyStoredItems');
var Item = require('app/models/item');
var wh = require('app/lib/warehouse');

module.exports = function(source, contentType, totalPages, done) {
  debug('verifyStoredItems totalPages: %s', totalPages);

  var contentTypes = contentType ? [contentType] : source.contentTypes;
  var itemDataObjectsCount = totalPages ? totalPages * source.itemsLimit : undefined;
  //var totalItemDataObjects = 0;

  async.each(contentTypes, (contentType, done) => {
    var itemDataObjects = wh.itemDataObjects(contentType, itemDataObjectsCount);
    //totalItemDataObjects += itemDataObjects.length;

    Item.count({
      contentType: contentType.id
    }, (error, count) => {
      try {
        assert.equal(count, itemDataObjects.length);
        done();
      } catch (error) {
        done(error);
      }
    });
  }, (error) => {
    if (error) {
      return done(error);
    }

    try {
      //assert.equal(app.emit.callCount, totalItemDataObjects);
      done();
    } catch (error) {
      return done(error);
    }
  });
};