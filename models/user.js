module.exports = function(mongoose) {
  var logger = require('../logger');

  var userSchema = mongoose.Schema({
    storages: {
      dropbox: {
        token: String,
        id: Number
      }
    },
    sources: {
      foursquare: {
        token: String,
        id: Number
      }
    }
  });

  userSchema.statics.findOrCreate = function(attributes, callback) {
    _this = this;

    this.findOne(attributes, function(error, user) {
      if (user) {
        logger.trace('user.findOrCreate user found', { user_id: user.id });
        callback(error, user);
      } else {
        _this.create(attributes, function(error, user) {
          logger.trace('user.findOrCreate new user created', { user_id: user.id });
          callback(error, user);
        });
      }
    });
  };

  return mongoose.model('User', userSchema);
}