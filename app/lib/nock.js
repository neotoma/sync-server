var Debug = require('debug');
var itemController = require('app/controllers/item');
var nock = require('nock');
var url = require('url');
var wh = require('app/lib/warehouse');

module.exports = {
  cleanAll: nock.cleanAll,
  
  /**
   * Nock GET request to given URL with given response body and status code
   * @param {string} requestUrl - Request URL
   * @param {Object|string} responseBody - Response body
   * @param {number} [responseStatus=200] - Response status code
   */
  get: function(requestUrl, responseBody, responseStatus) {
    Debug('syncServer:test:nock:get')('get %s', requestUrl);

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

    var debug = Debug('syncServer:test:nock');
    debug('getItemPages with source %s, userSourceAuth %s for %s contentTypes', source.id, userSourceAuth.id, contentTypes.length);

    contentTypes.forEach((contentType) => {
      var debug = Debug('syncServer:test:nock:getItemPages');
      var itemPages = wh.itemPages(source, contentType, userSourceAuth);
      var offset = 0;

      debug('getItemPages with contentType %s for %s pages', contentType.id, itemPages.length);

      itemPages.forEach((page) => {
        debug('getItemPages with contentType %s for page with %s items', contentType.id, itemController.itemDataObjectsFromPage(page, source, contentType).length);

        this.get(itemController.itemsGetUrl(source, contentType, userSourceAuth, { offset: offset }), page);
        offset = offset + itemController.itemDataObjectsFromPage(page, source, contentType).length;
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

    var debug = Debug('syncServer:test:nock');
    debug('putItems with source %s, storage %s, userStorageAuth %s for %s contentTypes', source.id, storage.id, userStorageAuth.id, contentTypes.length);

    contentTypes.forEach((contentType) => {
      wh.itemDataObjects(contentType).forEach(() => {
        this.postStorage(storage, userStorageAuth);
      });
    });

    debug('putItems done');

    done();
  }
};