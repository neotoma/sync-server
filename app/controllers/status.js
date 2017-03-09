var async = require('async');
var Item = require('app/models/item');
var Status = require('app/models/status');

module.exports = {
  json: function(done, attributes) {
    Status.find(attributes, function(error, statuses) {
      if (error) {
        return done(error);
      }

      var items = [];

      var findItems = function(status, done) {
        Item.count({
          user: status.user.id,
          source: status.source.id,
          contentType: status.contentType.id,
          storageAttemptedAt: { '$ne': null },
          '$and': [{
            storageVerifiedAt: null
          }, {
            storageFailedAt: null
          }]
        }, function(error, count) {
          if (error) {
            return done(error);
          } else {
            status.totalItemsPending = count;
            
            Item.count({
              user: status.user.id,
              source: status.source.id,
              contentType: status.contentType.id,
              storageVerifiedAt: { '$ne': null }
            }, function(error, count) {
              if (error) {
                return done(error);
              } else {
                status.totalItemsStored = count;

                if (count) {
                  Item.findOne({ 
                    source: status.source.id, 
                    contentType: status.contentType.id 
                  }).sort({ storageVerifiedAt: -1 }).exec(function(error, item) {
                    if (item) {
                      status.lastStoredItem = item.get('id');
                      items.push(item);
                    }

                    done();
                  });
                } else {
                  done();
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

        done(error, data);
      });
    });
  }
};