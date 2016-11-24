module.exports = function(attributes) {
  if (!attributes) {
    throw new Error('Parameter attributes undefined or null');
  }

  if (!attributes.id) {
    throw new Error('Parameter attributes has no id property');
  }

  if (typeof attributes.id !== 'string') {
    throw new Error('Property id of attributes not a string');
  }

  if (!attributes.host) {
    throw new Error('Parameter attributes has no host property');
  }

  if (typeof attributes.host !== 'string') {
    throw new Error('Property host of attributes not a string');
  }

  if (attributes.itemUrl && typeof attributes.itemUrl !== 'function') {
    throw new Error('Property itemUrl of attributes not a function');
  }

  this.id = attributes.id;
  this.host = attributes.host;

  if (attributes.itemUrl) {
    this.itemUrl = attributes.itemUrl;
  } else {
    this.itemUrl = function(path, userStorageAuth) {
      if (!path) {
        throw new Error('Parameter path undefined or null');
      }

      if (typeof path !== 'string') {
        throw new Error('Parameter path not string');
      }

      if (!userStorageAuth) {
        throw new Error('Parameter userStorageAuth undefined or null');
      }

      if (!userStorageAuth.storageToken) {
        throw new Error('Parameter userStorageAuth has no storageToken property');
      }

      return 'https://' + this.host + path + '?access_token=' + userStorageAuth.storageToken;
    };
  }
};