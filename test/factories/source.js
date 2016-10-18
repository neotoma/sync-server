var async = require('async');
var Source = require('../../models/source');
var ContentType = require('../../models/contentType');
var factory = {};

factory.makeOne = function(attributes, n, done) {
  if (!done) {
    throw new Error('No done parameter provided');
  }

  n = (typeof n !== 'undefined') ? n : '';

  if (!attributes) {
    attributes = {
      id: 'megaplex' + n,
      name: 'Megaplex' + n,
      enabled: true,
      logoGlyphPath: '/images/logos/megaplex.svg' + n,
      contentTypes: [
        new ContentType('widget'),
        new ContentType('gadget')
      ],
      host: 'megaplex.example.com' + n,
      apiVersion: 5,
      itemsLimit: 98,
      clientId: 'megaplexClientId' + n,
      clientSecret: 'megaplexClientSecret' + n,
      consumerKey: 'megaplexConsumerKey' + n,
      consumerSecret: 'megaplexConsumerSecret' + n,
      itemAssetLinks: {
        foo1: 'bar1' + n,
        foo2: 'bar2' + n
      }
    };
  }

  done(null, new Source(attributes));
};

factory.makeMany = function(n, done) {
  if (!done) {
    throw new Error('No done parameter provided');
  }

  var self = this;

  if (!n) {
    return done(new Error('No n value provided'));
  }

  var makeOne = function(n, next) {
    self.makeOne(null, n, next);
  };

  async.times(n, makeOne, function(error, sources) {
    done(error, sources);
  });
}

module.exports = factory;