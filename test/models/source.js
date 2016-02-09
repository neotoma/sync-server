var test_database = 'sync_test';
var assert = require('assert');
var Source = require('../../models/source');
var ContentType = require('../../models/content_type');

describe('source', function() {
  before(function() {
    this.source = new Source({
      id: 'megaplex',
      name: 'Megaplex',
      enabled: true,
      logo_glyph_path: '/images/logos/megaplex.svg',
      content_types: [
        new ContentType('widget'),
        new ContentType('gadget')
      ],
      host: 'megaplex.example.com',
      api_version: 5,
      default_items_limit: 98,
      client_id: 'megaplexClientId',
      client_secret: 'megaplexClientSecret',
      item_asset_links: []
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