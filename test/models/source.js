var assert = require('assert');
var Source = require('../../models/source');
var ContentType = require('../../models/content_type');

describe('new source', function() {
  before(function() {
    this.source = new Source({
      id: 'megaplex',
      name: 'Megaplex',
      enabled: true,
      logoGlyphPath: '/images/logos/megaplex.svg',
      contentTypes: [
        new ContentType('widget'),
        new ContentType('gadget')
      ],
      host: 'megaplex.example.com',
      apiVersion: 5,
      defaultItemsLimit: 98,
      clientId: 'megaplexClientId',
      clientSecret: 'megaplexClientSecret',
      itemAssetLinks: []
    });
  });

  it('has id', function() {
    assert.equal(this.source.id, 'megaplex');
  });

  it('has name', function() {
    assert.equal(this.source.name, 'Megaplex');
  });

  it('has enabled', function() {
    assert.equal(this.source.enabled, true);
  });

  it('has logoGlyphPath', function() {
    assert.equal(this.source.logoGlyphPath, '/images/logos/megaplex.svg');
  });

  it('has contentTypes', function() {
    assert.equal(this.source.contentTypes.length, 2);
  });

  it('has host', function() {
    assert.equal(this.source.host, 'megaplex.example.com');
  });

  it('has apiVersion', function() {
    assert.equal(this.source.apiVersion, 5);
  });

  it('has defaultItemsLimit', function() {
    assert.equal(this.source.defaultItemsLimit, 98);
  });

  it('has default defaultItemsLimit');

  it('has clientId', function() {
    assert.equal(this.source.clientId, 'megaplexClientId');
  });

  it('has clientSecret', function() {
    assert.equal(this.source.clientSecret, 'megaplexClientSecret');
  });

  it('has itemAssetLinks');
  it('has itemsRemotePath');
  it('has toObject');
});