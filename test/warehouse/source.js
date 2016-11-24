var ContentType = require('../../models/contentType');

module.exports = require('./warehouse')('source', {
  id: 'megaplex',
  name: 'Megaplex',
  enabled: true,
  logoGlyphPath: '/images/logos/megaplex.svg',
  contentTypes: [
    new ContentType({ id: 'widget' }),
    new ContentType({ id: 'gadget' })
  ],
  host: 'megaplex.example.com',
  apiVersion: 5,
  itemsLimit: 98,
  clientId: 'megaplexClientId',
  clientSecret: 'megaplexClientSecret',
  consumerKey: 'megaplexConsumerKey',
  consumerSecret: 'megaplexConsumerSecret'
});