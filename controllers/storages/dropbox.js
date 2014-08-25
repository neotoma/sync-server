var logger = require('../../lib/logger');
var https = require('https');
var UserStorageAuth = require('../../models/user-storage-auth');

var dropbox = {};

dropbox.saveFile = function(user, path, content, callback, error) {
  var _error = error;

  UserStorageAuth.findOne({
    storage_id: "dropbox",
    user_id:    user.id
  }, function(error, userStorageAuth) {
    if (error) {
      logger.error('failed to retrieve user storage auth for user');
      return _error(error);
    }

    var options = {
      host: 'api-content.dropbox.com',
      path: '/1/files_put/sandbox/' + path + '?access_token=' + userStorageAuth.storage_token,
      method: 'PUT'
    };

    try {
      var req = https.request(options, function(res) {
        if (res.statusCode == 401) {
          throw new Error('unauthorized request');
        }

        var data = '';

        res.on('data', function(chunk) {
          data += chunk;
        });

        res.on('end', function() {
          try {
            if (callback) {
              var parsedData = JSON.parse(data);
              callback(parsedData);
            }
          } catch(error) {
            logger.error('failed to parse dropbox saveFile response', { data: data });
            
            if (typeof error != 'undefined') {
              _error(error);
            }
          }
        });
      }).on('error', function(error) {
        if (typeof error != 'undefined') {
          _error(error);
        }
      });

      req.write(content);
      req.end();
    } catch (error) {
      if (typeof error != 'undefined') {
        _error(error);
      }
    }
  });
};

module.exports = dropbox;