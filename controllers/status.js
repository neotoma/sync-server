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
          user_id: status.user_id,
          source_id: status.source_id,
          content_type_id: status.content_type_id,
          sync_attempted_at: { '$ne': null },
          '$and': [{
            sync_verified_at: null
          }, {
            sync_failed_at: null
          }]
        }, function(error, count) {
          if (error) {
            return callback(error);
          } else {
            status.total_items_pending = count;
            
            Item.count({
              user_id: status.user_id,
              source_id: status.source_id,
              content_type_id: status.content_type_id,
              sync_verified_at: { '$ne': null }
            }, function(error, count) {
              if (error) {
                return callback(error);
              } else {
                status.total_items_synced = count;

                if (count) {
                  Item.findOne({ source_id: status.source_id, content_type_id: status.content_type_id }).sort({ sync_verified_at: -1 }).exec(function(error, item) {
                    if (item) {
                      status.last_synced_item_id = item.get('id');
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