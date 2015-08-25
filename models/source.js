module.exports = function(properties) {
  this.id                   = properties.id,
  this.name                 = properties.name,
  this.enabled              = properties.enabled,
  this.logoGlyphPath        = properties.logo_glyph_path,
  this.contentTypes         = properties.content_types,
  this.host                 = properties.host,
  this.apiVersion           = properties.api_version;
  this.defaultItemsLimit    = typeof properties.default_items_limit !== 'undefined' ? properties.default_items_limit : 250;
  this.clientId             = properties.client_id;
  this.clientSecret         = properties.client_secret;
  this.itemAssetLinks       = properties.item_asset_links;

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