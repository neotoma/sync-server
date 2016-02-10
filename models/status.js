var logger = require('../lib/logger');
var mongoose = require('../lib/mongoose')();

var statusSchema = mongoose.Schema({
  userId: String,
  storageId: String,
  sourceId: String,
  contentTypeId: String,
  totalItemsAvailable: Number,
  totalItemsSynced: Number,
  totalItemsPending: Number,
  lastSyncedItemId: String
});

statusSchema.set('toObject', { getters: true });
statusSchema.options.toObject.transform = mongoose.transform;

statusSchema.statics.findOrCreate = function(attributes, callback) {
  _this = this;
  logger.trace('finding or creating status', { attributes: attributes });

  this.findOne(attributes, function(error, status) {
    if (error) {
      logger.error('unable to find or create status', { attributes: attributes });
      callback(error);
    } else {
      if (status) {
        logger.trace('found status', { id: status.id });
        callback(error, status);
      } else {
        _this.create(attributes, function(error, status) {
          if (error) {
            logger.error('failed to create new status', { error: error.message });
          } else {
            logger.trace('created new status', { id: status.id });
          }
          
          callback(error, status);
        });
      }
    }
  });
};

module.exports = mongoose.model('Status', statusSchema);