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
    return {
      id: this.id,
      name: this.name,
      enabled: this.enabled,
      logoGlyphPath: this.logoGlyphPath,
      contentTypes: this.contentTypes,
      userSourceAuths: userSourceAuths.map(function(userSourceAuth) {
        if (userSourceAuth.source == source.id) {
          return userSourceAuth.id;
        }
      })
    };
  };
}