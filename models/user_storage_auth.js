var logger = require('../lib/logger');
var mongoose = require('../lib/mongoose');

var userStorageAuthSchema = mongoose.Schema({
  userId: String,
  storageId: String,
  storageToken: String,
  storageUserId: String
});

userStorageAuthSchema.set('toObject', { getters: true });
userStorageAuthSchema.options.toObject.transform = mongoose.transform;

userStorageAuthSchema.statics.findOrCreate = function(attributes, callback) {
  _this = this;
  logger.trace('finding or creating user storage auth', { attributes: attributes });

  this.findOne(attributes, function(error, userStorageAuth) {
    if (userStorageAuth) {
      logger.trace('found user storage auth', { id: userStorageAuth.id });
      callback(error, userStorageAuth);
    } else {
      _this.create(attributes, function(error, userStorageAuth) {
        if (error) {
          logger.error('failed to create new user storage auth', { error: error.message });
        } else {
          logger.trace('created new user storage auth', { id: userStorageAuth.id });
        }
        
        callback(error, userStorageAuth);
      });
    }
  });
};

module.exports = mongoose.model('UserStorageAuth', userStorageAuthSchema);