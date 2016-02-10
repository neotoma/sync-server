var logger = require('../lib/logger');
var mongoose = require('../lib/mongoose');

var userSchema = mongoose.Schema({
  name: String,
  email: String
});

userSchema.set('toObject', { getters: true });
userSchema.options.toObject.transform = mongoose.transform;

userSchema.statics.findOrCreate = function(attributes, callback) {
  _this = this;
  logger.trace('finding or creating user', { attributes: attributes });

  this.findOne(attributes, function(error, user) {
    if (user) {
      logger.trace('found user', { id: user.id });
      callback(error, user);
    } else {
      _this.create(attributes, function(error, user) {
        if (error) {
          logger.error('failed to create new user', { error: error.message });
        } else {
          logger.trace('created new user', { id: user.id });
        }
        
        callback(error, user);
      });
    }
  });
};

module.exports = mongoose.model('User', userSchema);