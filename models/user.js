module.exports = function(mongoose) {
  var userSchema = mongoose.Schema({
    storages: {
      dropbox: {
        token: String
      }
    },
    sources: {
      foursquare: {
        token: String
      }
    }
  });

  userSchema.statics.findOrCreate = function(conditions, callback) {
    _this = this;

    this.findOne(conditions, function(error, user) {

      if (user) {
        callback(error, user);
      } else {
        _this.create(conditions, function(error, user) {
          callback(error, user);
        });
      }
    });
  };

  return mongoose.model('User', userSchema);
}