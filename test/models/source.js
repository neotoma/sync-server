var db = require('../db');
var wh = require('../warehouse/source');
var assert = require('assert');
var async = require('async');
var Source = require('../../models/source');
var SourceFactory = require('../factory')('source');
var UserSourceAuth = require('../../models/userSourceAuth');

describe('source module', function() {
  before(db.clear);

  it('has defaultItemsLimit', function() {
    assert(Source.defaultItemsLimit > 0);
  });
});

describe('new source', function() {
  before(db.clear);
  
  before(function(done) {
    var self = this;
    SourceFactory.create(function(error, source) {
      self.source = source;
      done();
    }, wh.attributes);
  });

  it('has id', function() {
    assert.equal(this.source.id, wh.attributes.id);
  });

  it('has name', function() {
    assert.equal(this.source.name, wh.attributes.name);
  });

  it('has enabled', function() {
    assert.equal(this.source.enabled, wh.attributes.enabled);
  });

  it('has logoGlyphPath', function() {
    assert.equal(this.source.logoGlyphPath, wh.attributes.logoGlyphPath);
  });

  it('has contentTypes', function() {
    assert.equal(this.source.contentTypes.length, wh.attributes.contentTypes.length);
    assert.equal(this.source.contentTypes[0].id, wh.attributes.contentTypes[0].id);
  });

  it('has host', function() {
    assert.equal(this.source.host, wh.attributes.host);
  });

  it('has apiVersion', function() {
    assert.equal(this.source.apiVersion, wh.attributes.apiVersion);
  });

  it('has itemsLimit', function() {
    assert.equal(this.source.itemsLimit, wh.attributes.itemsLimit);
  });

  it('has clientId', function() {
    assert.equal(this.source.clientId, wh.attributes.clientId);
  });

  it('has clientSecret', function() {
    assert.equal(this.source.clientSecret, wh.attributes.clientSecret);
  });

  it('has consumerKey', function() {
    assert.equal(this.source.consumerKey, wh.attributes.consumerKey);
  });

  it('has clientSecret', function() {
    assert.equal(this.source.clientSecret, wh.attributes.clientSecret);
  });

  it('has itemAssetLinks', function() {
    assert.equal(this.source.itemAssetLinks, wh.attributes.itemAssetLinks);
  });

  it('has toObject', function() {
    var object = this.source.toObject();
    assert.equal(object.id, wh.attributes.id);
    assert.equal(object.name, wh.attributes.name);
    assert.equal(object.enabled, wh.attributes.enabled);
    assert.equal(object.logoGlyphPath, wh.attributes.logoGlyphPath);
    assert.equal(object.host, wh.attributes.host);
    assert.equal(object.apiVersion, wh.attributes.apiVersion);
    assert.equal(object.itemsLimit, wh.attributes.itemsLimit);
    assert.equal(object.clientId, wh.attributes.clientId);
    assert.equal(object.clientSecret, wh.attributes.clientSecret);
    assert.equal(object.consumerKey, wh.attributes.consumerKey);
    assert.equal(object.consumerSecret, wh.attributes.consumerSecret);
    assert.equal(object.itemAssetLinks, wh.attributes.itemAssetLinks);
    assert.equal(object.contentTypes.length, wh.attributes.contentTypes.length);
    assert.equal(object.contentTypes[0], wh.attributes.contentTypes[0].id);
  });

  it('has toObject with userSourceAuths', function(done) {
    var self = this;

    var createUserSourceAuth = function(n, next) {
      UserSourceAuth.create({
        userId: 'userId' + n,
        sourceId: wh.attributes.id,
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
      delete wh.attributes.itemsLimit;
      this.source = new Source(wh.attributes);
    });

    it('has default itemsLimit', function() {
      assert.equal(this.source.itemsLimit, Source.defaultItemsLimit);
    });
  });
});