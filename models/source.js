module.exports = function(properties) {
  this.id                   = properties.id,
  this.name                 = properties.name,
  this.enabled              = properties.enabled,
  this.logoGlyphPath        = properties.logoGlyphPath,
  this.contentTypes         = properties.contentTypes,
  this.host                 = properties.host,
  this.apiVersion           = properties.apiVersion;
  this.defaultItemsLimit    = typeof properties.defaultItemsLimit !== 'undefined' ? properties.defaultItemsLimit : 250;

  this.itemsRemotePath = function(contentType, userSourceAuth, offset) {
    return;
  };

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
        if (userSourceAuth.source == self.id) {
          return userSourceAuth.id;
        }
      })

      userSourceAuthIds = userSourceAuthIds.filter(function(n) { return n != undefined });

      if (userSourceAuthIds.length == 0) {
        userSourceAuthIds = null;
      }
    }

    return {
      id: this.id,
      name: this.name,
      enabled: this.enabled,
      logoGlyphPath: this.logoGlyphPath,
      contentTypes: contentTypeIds,
      userSourceAuths: userSourceAuthIds
    };
  };
}