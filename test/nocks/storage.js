var nock = require('nock');

module.exports = function(storage, userStorageAuth) {
  var storageNock = nock('https://' + storage.host);

  storageNock.persist().put(/.+/).query({
    access_token: userStorageAuth.storageToken
  }).reply(function(url, body) {
    return [200, 'Success'];
  });

  storageNock.persist().put(/.+/).reply(401);

  return storageNock;
};