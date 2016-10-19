var ObjectFactory = require('./object');
var Source = require('../../models/source');
var ContentType = require('../../models/contentType');

module.exports = new ObjectFactory(Source, {
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
});