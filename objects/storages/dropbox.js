var Storage = require('../../models/storage');

module.exports = new Storage({
  id: 'dropbox',
  host: 'api-content.dropbox.com',
  itemUrl: function(path, userStorageAuth) {
    return 'https://' + this.host + '/1/files_put/sandbox/' + path + '?access_token=' + userStorageAuth.storageToken;
  }
});