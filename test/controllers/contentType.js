require('../db');
var assert = require('assert');
var controller = require('../../controllers/contentType');
var SourceFactory = require('../factory')('source');
var ContentType = require('../../models/contentType');

describe('contentType controller', function() {
  it('has supportedIds', function() {
    assert(controller.supportedIds.length);
  });

  it('has toObject', function() {
    var object = controller.toObject();

    assert.equal(object.length, controller.supportedIds.length);

    object.forEach(function(contentTypeObject) {
      assert(controller.supportedIds.indexOf(contentTypeObject.id) > -1);
    });
  });

  it('has toObject with sources', function(done) {
    var sources = SourceFactory.createMany(5, function(error, sources) {
      sources.forEach(function(source) {
        var contentType = new ContentType({ id: controller.supportedIds[0] });
        source.contentTypes = [contentType];
      });

      var object = controller.toObject(sources);

      sources.forEach(function(source) {
        assert(object[0].sourceIds.indexOf(source.id) > -1);
      });

      done();
    });
  });
});