require('park-ranger')();
var assert = require('assert');
var assertions = require('app/lib/assertions');
var async = require('async');
var controller = require('app/controllers/item');
var mongoose = require('app/lib/mongoose');
var wh = require('app/lib/warehouse');

describe('itemController.persistItemDataObject method', function() {
  beforeEach(mongoose.removeAllCollections);

  assertions.function.callbacks.error(controller.persistItemDataObject, [{
    when: 'no itemDataObject parameter provided',
    params: [undefined, wh.itemRelationships()],
    error: 'Parameter itemDataObject undefined or null',
  }, {
    when: 'no relationships parameter provided',
    params: [wh.itemDataObject(), undefined],
    error: 'Parameter relationships undefined or null',
  }, {
    when: 'itemDataObject parameter has no id property',
    params: [wh.itemDataObject(), wh.itemRelationships()],
    error: 'Parameter itemDataObject has no id property',
    before: function(done) {
      Object.assign(this.params[0], {
        id: undefined
      });

      done();
    }
  }, {
    when: 'relationships parameter has no user property',
    params: [wh.itemDataObject(), wh.itemRelationships()],
    error: 'Parameter relationships has no user property',
    before: function(done) {
      Object.assign(this.params[1], {
        user: undefined
      });

      done();
    }
  }, {
    when: 'relationships parameter has no storage property',
    params: [wh.itemDataObject(), wh.itemRelationships()],
    error: 'Parameter relationships has no storage property',
    before: function(done) {
      Object.assign(this.params[1], {
        storage: undefined
      });
      
      done();
    }
  }, {
    when: 'relationships parameter has no source property',
    params: [wh.itemDataObject(), wh.itemRelationships()],
    error: 'Parameter relationships has no source property',
    before: function(done) {
      Object.assign(this.params[1], {
        source: undefined
      });
      
      done();
    }
  }, {
    when: 'relationships parameter has no contentType property',
    params: [wh.itemDataObject(), wh.itemRelationships()],
    error: 'Parameter relationships has no contentType property',
    before: function(done) {
      Object.assign(this.params[1], {
        contentType: undefined
      });
      
      done();
    }
  }]);

  assertions.function.callbacks.result(controller.persistItemDataObject, [{
    when: 'itemDataObject and relationships parameters provided',
    params: [wh.itemDataObject(), wh.itemRelationships()],
    before: function(done) {
      async.each(this.params[1], function(document, done) {
        document.save(done);
      }, done);
    },
    result: function(item, done) {
      assert.equal(item.sourceItem, this.params[0].id);

      Object.keys(this.params[1]).forEach((key) => {
        assert.equal(item[key].id, this.params[1][key].id);
      });

      done();
    }
  }]);
});