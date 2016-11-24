var ContentType = require('../../models/contentType');

module.exports = require('./warehouse')('source', {
  id: 'sourceplex',
  name: 'Sourceplex',
  enabled: true,
  logoGlyphPath: '/images/logos/sourceplex.svg',
  contentTypes: [
    new ContentType({ id: 'widget' }),
    new ContentType({ id: 'gadget' })
  ],
  host: 'sourceplex.com',
  apiVersion: 5,
  itemsLimit: 98,
  clientId: 'sourceplexClientId',
  clientSecret: 'sourceplexClientSecret',
  consumerKey: 'sourceplexConsumerKey',
  consumerSecret: 'sourceplexConsumerSecret'
});