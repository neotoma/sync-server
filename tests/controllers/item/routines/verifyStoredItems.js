var assert = require('assert'),
  async = require('async'),
  debug = require('app/lib/debug')('app:tests:verifyStoredItems'),
  Item = require('app/models/item'),
  wh = require('app/lib/warehouse');

module.exports = function(source, contentType, totalPages, done) {
  debug('verifyStoredItems totalPages: %s', totalPages);

  var contentTypes = contentType ? [contentType] : source.contentTypes;
  var itemDataObjectsCount = totalPages ? totalPages * source.itemsLimit : undefined;

  async.each(contentTypes, (contentType, done) => {
    var itemDataObjects = wh.itemDataObjects(contentType, itemDataObjectsCount);

    debug(`verifying stored items for contentType "${contentType.name}"`);

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
  }, done);
};
