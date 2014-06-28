var logger = require('../logger');

module.exports = function(mongoose) {
  var userSourceAuthSchema = mongoose.Schema({
    user_id: String,
    source_id: String,
    source_token: String,
    source_user_id: String
  });

  userSourceAuthSchema.statics.findOrCreate = function(attributes, callback) {
    _this = this;
    logger.trace('finding or creating user source auth', { attributes: attributes });

    this.findOne(attributes, function(error, userSourceAuth) {
      if (userSourceAuth) {
        logger.trace('found user source auth', { id: userSourceAuth.id });
        callback(error, userSourceAuth);
      } else {
        _this.create(attributes, function(error, userSourceAuth) {
          if (error) {
            logger.warn('failed to create new user source auth', { error: error.message });
          } else {
            logger.trace('created new user source auth', { id: userSourceAuth.id });
          }
          
          callback(error, userSourceAuth);
        });
      }
    });
  };

  return mongoose.model('UserSourceAuth', userSourceAuthSchema);
}