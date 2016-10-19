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

  if (attributes.path && typeof attributes.path !== 'function') {
    throw new Error('Property path of attributes not a function');
  }

  this.id = attributes.id;
  this.host = attributes.host;

  if (attributes.path) {
    this.path = attributes.path;
  } else {
    this.path = function(subPath, userStorageAuth) {
      if (!subPath) {
        throw new Error('Parameter subPath undefined or null');
      }

      if (typeof subPath !== 'string') {
        throw new Error('Parameter subPath not string');
      }

      if (!userStorageAuth) {
        throw new Error('Parameter userStorageAuth undefined or null');
      }

      if (!userStorageAuth.storageToken) {
        throw new Error('Parameter userStorageAuth has no storageToken property');
      }

      return '/' + subPath + '?access_token=' + userStorageAuth.storageToken;
    };
  }
};