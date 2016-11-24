var Storage = require('../../models/storage');

module.exports = new Storage({
  id: 'dropbox',
  host: 'api-content.dropbox.com',
  path: function(subPath, userStorageAuth) {
    return '/1/files_put/sandbox/' + subPath + '?access_token=' + userStorageAuth.storageToken;
  }
});