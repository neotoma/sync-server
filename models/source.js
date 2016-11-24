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
      contentTypes: contentTypeIds,
      userSourceAuths: userSourceAuthIds
    };
  };

  this.itemsPageUrl = function(contentType, userSourceAuth, pagination) {
    var offset = (typeof pagination === 'undefined') ? 0 : pagination.offset;
    return 'https://' + this.host + '/' + contentType.pluralId + '?access_token=' + userSourceAuth.sourceToken + '&limit=' + this.itemsLimit + '&offset=' + offset;
  };

  this.itemsPageDataObjects = function(page, contentType) {
    if (page.response && page.response[contentType.pluralId]) {
      return page.response[contentType.pluralId].items;
    }
  };

  this.itemsPageTotalAvailable = function(page, contentType) {
    if (page.response && page.response[contentType.pluralId]) {
      return page.response[contentType.pluralId].count;
    }
  };

  this.itemsPageError = function(page) {
    if (page.meta && page.meta.code !== 200) {
      var message = page.meta.errorDetail ? page.meta.errorDetail : page.meta.errorType;
      return new Error(message);
    }
  };

  this.itemsPageNextPagination = function(page, contentType, pagination) {
    var nextPagination;
    
    if (page.response && page.response[contentType.pluralId] && page.response[contentType.pluralId].length) {
      nextPagination = {
        offset: pagination.offset + page.results.length
      };
    }

    return nextPagination;
  };

  this.itemDescription = function(item) {
    return;
  };
}

module.exports.defaultItemsLimit = defaultItemsLimit;