var logger = require('../logger');

module.exports = function(mongoose) {
  var userSchema = mongoose.Schema({
    name: String,
    email: String
  });

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
            logger.warn('failed to create new user', { error: error.message });
          } else {
            logger.trace('created new user', { id: user.id });
          }
          
          callback(error, user);
        });
      }
    });
  };

  return mongoose.model('User', userSchema);
}