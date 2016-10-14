var assert = require('assert');
var async = require('async');
var Source = require('../../models/source');
var ContentType = require('../../models/contentType');
var UserSourceAuth = require('../../models/userSourceAuth');

var sourceAttributes = {
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
  itemsLimit: 98,
  clientId: 'megaplexClientId',
  clientSecret: 'megaplexClientSecret',
  consumerKey: 'megaplexConsumerKey',
  consumerSecret: 'megaplexConsumerSecret',
  itemAssetLinks: {
    foo1: 'bar1',
    foo2: 'bar2'
  }
};

describe('source module', function() {
  it('has defaultItemsLimit', function() {
    assert(Source.defaultItemsLimit > 0);
  });
});

describe('new source', function() {
  before(function() {
    this.source = new Source(sourceAttributes);
  });

  it('has id', function() {
    assert.equal(this.source.id, sourceAttributes.id);
  });

  it('has name', function() {
    assert.equal(this.source.name, sourceAttributes.name);
  });

  it('has enabled', function() {
    assert.equal(this.source.enabled, sourceAttributes.enabled);
  });

  it('has logoGlyphPath', function() {
    assert.equal(this.source.logoGlyphPath, sourceAttributes.logoGlyphPath);
  });

  it('has contentTypes', function() {
    assert.equal(this.source.contentTypes.length, sourceAttributes.contentTypes.length);
    assert.equal(this.source.contentTypes[0].id, sourceAttributes.contentTypes[0].id);
  });

  it('has host', function() {
    assert.equal(this.source.host, sourceAttributes.host);
  });

  it('has apiVersion', function() {
    assert.equal(this.source.apiVersion, sourceAttributes.apiVersion);
  });

  it('has itemsLimit', function() {
    assert.equal(this.source.itemsLimit, sourceAttributes.itemsLimit);
  });

  it('has clientId', function() {
    assert.equal(this.source.clientId, sourceAttributes.clientId);
  });

  it('has clientSecret', function() {
    assert.equal(this.source.clientSecret, sourceAttributes.clientSecret);
  });

  it('has consumerKey', function() {
    assert.equal(this.source.consumerKey, sourceAttributes.consumerKey);
  });

  it('has clientSecret', function() {
    assert.equal(this.source.clientSecret, sourceAttributes.clientSecret);
  });

  it('has itemAssetLinks', function() {
    assert.equal(this.source.itemAssetLinks, sourceAttributes.itemAssetLinks);
  });

  it('has toObject', function() {
    var object = this.source.toObject();
    assert.equal(object.id, sourceAttributes.id);
    assert.equal(object.name, sourceAttributes.name);
    assert.equal(object.enabled, sourceAttributes.enabled);
    assert.equal(object.logoGlyphPath, sourceAttributes.logoGlyphPath);
    assert.equal(object.host, sourceAttributes.host);
    assert.equal(object.apiVersion, sourceAttributes.apiVersion);
    assert.equal(object.itemsLimit, sourceAttributes.itemsLimit);
    assert.equal(object.clientId, sourceAttributes.clientId);
    assert.equal(object.clientSecret, sourceAttributes.clientSecret);
    assert.equal(object.consumerKey, sourceAttributes.consumerKey);
    assert.equal(object.consumerSecret, sourceAttributes.consumerSecret);
    assert.equal(object.itemAssetLinks, sourceAttributes.itemAssetLinks);
    assert.equal(object.contentTypes.length, sourceAttributes.contentTypes.length);
    assert.equal(object.contentTypes[0], sourceAttributes.contentTypes[0].id);
  });

  it('has toObject with userSourceAuths', function(done) {
    var self = this;

    var createUserSourceAuth = function(n, next) {
      UserSourceAuth.create({
        userId: 'userId' + n,
        sourceId: sourceAttributes.id,
        sourceUserId: 'sourceUserId' + n
      }, function(error, userSourceAuth) {
        next(error, userSourceAuth);
      });
    };

    async.times(5, createUserSourceAuth, function(error, userSourceAuths) {
      var object = self.source.toObject(userSourceAuths);
      assert.equal(object.userSourceAuths.length, userSourceAuths.length);
      assert.equal(object.userSourceAuths[0], userSourceAuths[0].id);
      done(error);
    });
  });

  it('has toObject with no invalid userSourceAuths', function(done) {
    var self = this;

    var createUserSourceAuth = function(n, next) {
      UserSourceAuth.create({
        userId: 'userId' + n,
        sourceId: 'otherSource',
        sourceUserId: 'sourceUserId' + n
      }, function(error, userSourceAuth) {
        next(error, userSourceAuth);
      });
    };

    async.times(5, createUserSourceAuth, function(error, userSourceAuths) {
      var object = self.source.toObject(userSourceAuths);
      assert.equal(object.userSourceAuths.length, 0);
      done(error);
    });
  });

  describe('created with no itemsLimit', function() {
    before(function() {
      delete sourceAttributes.itemsLimit;
      this.source = new Source(sourceAttributes);
    });

    it('has default itemsLimit', function() {
      assert.equal(this.source.itemsLimit, Source.defaultItemsLimit);
    });
  });
});