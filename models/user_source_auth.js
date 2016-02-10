var logger = require('../lib/logger');
var mongoose = require('../lib/mongoose')();

var userSourceAuthSchema = mongoose.Schema({
  userId: String,
  sourceId: String,
  sourceToken: String,
  sourceUserId: String
});

userSourceAuthSchema.set('toObject', { getters: true });
userSourceAuthSchema.options.toObject.transform = mongoose.transform;

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
          logger.error('failed to create new user source auth', { error: error.message });
        } else {
          logger.trace('created new user source auth', { id: userSourceAuth.id });
        }
        
        callback(error, userSourceAuth);
      });
    }
  });
};

module.exports = mongoose.model('UserSourceAuth', userSourceAuthSchema);