var mongoose = require('../lib/mongoose');
var logger = require('../lib/logger');

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
  new: function(name, attributes, staticMethods) {
    var schema = mongoose.Schema(attributes, {
      timestamps: true
    });

    schema.set('toObject', { getters: true });
    schema.options.toObject.transform = mongoose.transform;

    schema.statics.findOrCreate = function(attributes, callback) {
      _this = this;
      logger.trace('finding or creating ' + name, { attributes: attributes });

      this.findOne(attributes, function(error, object) {
        if (object) {
          logger.trace('found ' + name, { id: object.id });
          callback(error, object);
        } else {
          _this.create(attributes, function(error, object) {
            if (error) {
              logger.error('failed to create new ' + name, { error: error.message });
            } else {
              logger.trace('created new ' + name, { id: object.id });
            }
            
            callback(error, object);
          });
        }
      });
    };

    if (staticMethods) {
      for (var key in staticMethods) {
        schema.statics[key] = staticMethods[key];
      }
    }

    return mongoose.model(capitalizeFirstLetter(name), schema);
  }
}