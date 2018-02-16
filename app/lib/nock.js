var debug = require('app/lib/debug')('app:tests:nock'),
  itemDataObjectsFromPage = require('app/controllers/item/itemDataObjectsFromPage'),
  itemsGetUrl = require('app/controllers/item/itemsGetUrl'),
  nock = require('nock'),
  url = require('url'),
  wh = require('app/lib/warehouse');

module.exports = {
  cleanAll: nock.cleanAll,
  
  /**
   * Nock GET request to given URL with given response body and status code
   * @param {string} requestUrl - Request URL
   * @param {Object|string} responseBody - Response body
   * @param {number} [responseStatus=200] - Response status code
   */
  get: function(requestUrl, responseBody, responseStatus) {
    debug('get %s', requestUrl);

    var urlObject = url.parse(requestUrl);

    return nock(urlObject.protocol + '//' + urlObject.host).get(urlObject.path).reply(responseStatus ? responseStatus : 200, responseBody);
  },

  /**
   * Nock POST request to host URL of storage and any path using access token of userStorageAuth
   * Response includes given response status code and JSON body with bytes property that contains mock value
   * @param {Object} storage - Storage
   * @param {Object} userStorageAuth - UserStorageAuth
   * @param {number} [responseStatus=200] - Response status code
   * @param {string} [path=wh.jsonPath] - Path in response body
   */
  postStorage: function(storage, userStorageAuth, responseStatus, path) {
    return nock('https://' + storage.host).post(/.+/).query((query) => {
      return (query['access_token'] === userStorageAuth.storageToken);
    }).reply(responseStatus ? responseStatus : 200, {
      size: wh.bytes,
      path_lower: path ? path : wh.jsonPath
    });
  },

  /**
   * Nock GET requests to all item pages at source for contentType using userSourceAuth
   * If no contentType provided, nock requests for all contentTypes supported by source
   * @param {source} source - Source
   * @param {source} [contentType] - ContentType
   * @param {userSourceAuth} - UserSourceAuth
   * @param {function} done - Error-first callback function expecting no additional parameters (optional)
   */
  getItemPages: function(source, contentType, userSourceAuth, done) {
    var contentTypes = contentType ? [contentType] : source.contentTypes;

    debug('getItemPages with source %s, userSourceAuth %s for %s contentTypes', source.id, userSourceAuth.id, contentTypes.length);

    contentTypes.forEach((contentType) => {
      var itemPages = wh.itemPages(source, contentType, userSourceAuth);
      var offset = 0;

      debug('getItemPages with contentType %s for %s pages', contentType.id, itemPages.length);

      itemPages.forEach((page) => {
        debug('getItemPages with contentType %s for page with %s items', contentType.id, itemDataObjectsFromPage(page, source, contentType).length);

        this.get(itemsGetUrl(source, contentType, userSourceAuth, { offset: offset }), page);
        offset = offset + itemDataObjectsFromPage(page, source, contentType).length;
      });
    });

    done();
  },

  /**
   * Nock PUT requests to storage for all item pages from source for contentType using userStorageAuth
   * If no contentType provided, nock requests for all contentTypes supported by source
   * @param {source} [contentType] - ContentType
   * @param {source} source - Source
   * @param {userStorageAuth} - UserStorageAuth
   * @param {storage} - Storage
   * @param {function} done - Error-first callback function expecting no additional parameters (optional)
   */
  putItems: function(source, contentType, storage, userStorageAuth, done) {
    var contentTypes = contentType ? [contentType] : source.contentTypes;

    debug('putItems with source %s, storage %s, userStorageAuth %s for %s contentTypes', source.id, storage.id, userStorageAuth.id, contentTypes.length);

    contentTypes.forEach((contentType) => {
      let itemDataObjects = wh.itemDataObjects(contentType);

      debug(`put ${itemDataObjects.length} itemDataObjects for contentType "${contentType.name}"`);

      itemDataObjects.forEach(() => {
        this.postStorage(storage, userStorageAuth);
      });
    });

    debug('putItems done');

    done();
  }
};
