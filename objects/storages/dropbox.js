var storage = {
  id: 'dropbox',
  host: 'api-content.dropbox.com'
};

storage.path = function(subPath, userStorageAuth) {
  return '/1/files_put/sandbox/' + subPath + '?access_token=' + userStorageAuth.storage_token;
};

module.exports = storage;