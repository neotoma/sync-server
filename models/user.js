module.exports = function(mongoose) {
  var userSchema = mongoose.Schema({
    storages: {
      dropbox: {
        token: String,
        id: String
      }
    },
    sources: {
      foursquare: {
        token: String,
        id: String
      }
    }
  });

  userSchema.statics.findOrCreate = function(attributes, callback) {
    _this = this;

    this.findOne(attributes, function(error, user) {
      if (user) {
        callback(error, user);
      } else {
        _this.create(attributes, function(error, user) {
          callback(error, user);
        });
      }
    });
  };

  return mongoose.model('User', userSchema);
}