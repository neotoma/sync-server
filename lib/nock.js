var nock = require('nock');
var url = require('url');

nock.get = function(requestUrl, responseBody, responseStatus) {
  var urlObject = url.parse(requestUrl);
  var hostname = urlObject.protocol + '//' + urlObject.host;
  var status = responseStatus ? responseStatus : 200;
  nock(hostname).get(urlObject.path).reply(responseStatus, responseBody);
};

module.exports = nock;