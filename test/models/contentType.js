var db = require('../db');
var wh = require('../warehouse/contentType');
var assert = require('assert');
var ContentType = require('../../models/contentType.js');
var Source = require('../../models/source.js');
var pluralize = require('pluralize');
require('../../lib/prototypes/string');

describe('new contentType', function() {
  before(db.clear);
  
  before(function() {
    this.contentType = new ContentType({ id: wh.attributes.id });
  });

  it('has id', function() {
    assert.equal(this.contentType.id, wh.attributes.id);
  });

  it('has pluralId', function() {
    assert.equal(this.contentType.pluralId, pluralize(wh.attributes.id));
  });

  it('has name', function() {
    assert.equal(this.contentType.name, wh.attributes.id.capitalizeFirstLetter());
  });

  it('has pluralName', function() {
    assert.equal(this.contentType.pluralName, pluralize(wh.attributes.id.capitalizeFirstLetter()));
  });

  it('has toObject', function() {
    var object = this.contentType.toObject();
    assert.equal(object.id, wh.attributes.id);
    assert.equal(object.pluralId, pluralize(wh.attributes.id));
    assert.equal(object.name, wh.attributes.id.capitalizeFirstLetter());
    assert.equal(object.pluralName, pluralize(wh.attributes.id.capitalizeFirstLetter()));
    assert.equal(object.sourceIds, null);
  });

  describe('with sources', function() {
    before(function() {
      var contentType2 = new ContentType({ id: 'gizmo' });
      this.sources = [
        new Source({id: 'alpha'}),
        new Source({id: 'beta', contentTypes: [this.contentType, contentType2]}),
        new Source({id: 'gamma', contentTypes: [contentType2]})
      ];
    });

    it('has toObject with sourceId', function() {
      var object = this.contentType.toObject(this.sources);
      assert.equal(object.sourceIds.length, 1);
      assert.equal(object.sourceIds[0], 'beta');
    });
  });
});