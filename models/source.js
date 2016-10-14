var defaultItemsLimit = 250;

module.exports = function(properties) {
  this.id = properties.id,
  this.name = properties.name,
  this.enabled = properties.enabled,
  this.logoGlyphPath = properties.logoGlyphPath,
  this.contentTypes = properties.contentTypes,
  this.host = properties.host,
  this.apiVersion = properties.apiVersion;
  this.itemsLimit = typeof properties.itemsLimit !== 'undefined' ? properties.itemsLimit : defaultItemsLimit;
  this.clientId = properties.clientId;
  this.clientSecret = properties.clientSecret;
  this.consumerKey = properties.consumerKey;
  this.consumerSecret = properties.consumerSecret;
  this.itemAssetLinks = properties.itemAssetLinks;

  this.toObject = function(userSourceAuths) {
    var contentTypeIds;
    var self = this;

    if (typeof this.contentTypes !== 'undefined') {
      contentTypeIds = this.contentTypes.map(function(contentType) {
        return contentType.id;
      });
    }

    var userSourceAuthIds;

    if (typeof userSourceAuths !== 'undefined') {
      userSourceAuthIds = userSourceAuths.map(function(userSourceAuth) {
        if (userSourceAuth.sourceId == self.id) {
          return userSourceAuth.id;
        }
      })

      userSourceAuthIds = userSourceAuthIds.filter(function(n) { return n != undefined });
    }

    return {
      id: this.id,
      name: this.name,
      enabled: this.enabled,
      logoGlyphPath: this.logoGlyphPath,
      host: this.host,
      apiVersion: this.apiVersion,
      itemsLimit: this.itemsLimit,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      consumerKey: this.consumerKey,
      consumerSecret: this.consumerSecret,
      itemAssetLinks: this.itemAssetLinks,
      contentTypes: contentTypeIds,
      userSourceAuths: userSourceAuthIds
    };
  };
}

module.exports.defaultItemsLimit = defaultItemsLimit;