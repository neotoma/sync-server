var nock = require('nock');
var url = require('url');

nock.get = function(requestUrl, responseBody, responseStatus) {
  var urlObject = url.parse(requestUrl);
  var hostname = urlObject.protocol + '//' + urlObject.host;
  var status = responseStatus ? responseStatus : 200;
  return nock(hostname).get(urlObject.path).reply(responseStatus, responseBody);
};

nock.putStorage = function(storage, userStorageAuth) {
  var scope = nock('https://' + storage.host);

  scope.put(/.+/).query({
    access_token: userStorageAuth.storageToken
  }).reply(function(url, body) {
    return [200, 'Success'];
  });

  scope.put(/.+/).reply(401);

  return scope;
};

module.exports = nock;