module.exports = function(attributes) {
  this.id = attributes.id;
  this.host = attributes.host;

  this.path = function(subPath, userStorageAuth) {
    return '/' + subPath + '?access_token=' + userStorageAuth.storageToken;
  };
};