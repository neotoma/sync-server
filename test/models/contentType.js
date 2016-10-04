var assert = require('assert');
var ContentType = require('../../models/contentType.js');
var Source = require('../../models/source.js');

describe('new contentType', function() {
  before(function() {
    this.contentType = new ContentType('widget');
  });

  it('has id', function() {
    assert.equal(this.contentType.id, 'widget');
  });

  it('has pluralId', function() {
    assert.equal(this.contentType.pluralId, 'widgets');
  });

  it('has name', function() {
    assert.equal(this.contentType.name, 'Widget');
  });

  it('has pluralName', function() {
    assert.equal(this.contentType.pluralName, 'Widgets');
  });

  it('has toObject', function() {
    var object = this.contentType.toObject();
    assert.equal(object.id, 'widget');
    assert.equal(object.pluralId, 'widgets');
    assert.equal(object.name, 'Widget');
    assert.equal(object.pluralName, 'Widgets');
    assert.equal(object.sourceIds, null);
  });

  describe('with sources', function() {
    before(function() {
      var contentType2 = new ContentType('gizmo');
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