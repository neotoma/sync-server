var Status = require('../models/status');
var Item = require('../models/item');
var async = require('async');
var logger = require('../lib/logger');

module.exports = {
  json: function(callback, attributes) {
    Status.find(attributes, function(error, statuses) {
      if (error) {
        return res.json({
          error: error
        });
      }

      var items = [];

      var findItems = function(status, callback) {
        Item.count({
          userId: status.userId,
          sourceId: status.sourceId,
          contentTypeId: status.contentTypeId,
          storageAttemptedAt: { '$ne': null },
          '$and': [{
            storageVerifiedAt: null
          }, {
            storageFailedAt: null
          }]
        }, function(error, count) {
          if (error) {
            return callback(error);
          } else {
            status.totalItemsPending = count;
            
            Item.count({
              userId: status.userId,
              sourceId: status.sourceId,
              contentTypeId: status.contentTypeId,
              storageVerifiedAt: { '$ne': null }
            }, function(error, count) {
              if (error) {
                return callback(error);
              } else {
                status.totalItemsSynced = count;

                if (count) {
                  Item.findOne({ sourceId: status.sourceId, contentTypeId: status.contentTypeId }).sort({ storageVerifiedAt: -1 }).exec(function(error, item) {
                    if (item) {
                      status.lastSyncedItemId = item.get('id');
                      items.push(item);
                    }

                    callback();
                  });
                } else {
                  callback();
                }
              }
            });
          }
        });
      };

      async.each(statuses, findItems, function(error) {
        var data = { 
          statuses: statuses.map(function(status) {
            return status.toObject();
          }),
          items: items.map(function(item) {
            return item.toObject();
          })
        };

        callback(error, data);
      });
    });
  }
};