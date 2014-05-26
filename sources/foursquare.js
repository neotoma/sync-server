module.exports = function(app, passport, storages) {
  var logger = require('../logger');
  var foursquarePassport = require('passport-foursquare');
  var https = require('https');
  var apiVersion = '20140404';
  var foursquare = {};

  foursquare.authFilter = function(req, res, next) {
    if (typeof req.user == 'undefined' || !req.user.sources.foursquare.token) {
      logger.trace('screened request with foursquare authFilter');

      req.session.sourcesFoursquareAuthRedirectPath = req.path;

      if (req.path == '/sources/foursquare/auth') {
        req.session.sourcesFoursquareAuthRedirectPath = null;
      } else {
        req.session.sourcesFoursquareAuthRedirectPath = req.path;
      }

      res.redirect('/sources/foursquare/auth');
      return;
    }

    next();
  };

  foursquare.sync = function(user) {
    foursquare.syncItems(user, 'checkins');
    foursquare.syncItems(user, 'tips');
    foursquare.syncItems(user, 'friends');
  };

  foursquare.syncItems = function(user, aspect) {
    try {
      logger.trace('starting foursquare items sync', { 
        user_id: user.id, 
        aspect: aspect 
      });

      var offset = 0;

      var syncNextPage = function() {
        logger.trace('syncing foursquare next page of items', { 
          user_id: user.id, 
          aspect: aspect,
          offset: offset
        });

        var options = {
          host: 'api.foursquare.com',
          path: '/v2/users/self/' + aspect + '?v=' + apiVersion + '&oauth_token=' + user.sources.foursquare.token + '&limit=250&offset=' + offset,
        };

        https.get(options, function(res) {
          if (res.statusCode == 401) {
            throw new Error('unauthorized request');
          }

          var data = '';

          res.on('data', function(chunk) {
            data += chunk;
          });

          res.on('end', function() {
            try {
              var json = JSON.parse(data);

              if (typeof json.meta.errorType != 'undefined') {
                throw new Error(json.meta.errorType + ' - ' + json.meta.errorDetail);
              }

              var items = json.response[aspect].items;

              logger.trace('retrieved foursquare next page of items', { 
                user_id: user.id, 
                aspect: aspect,
                offset: offset,
                total: items.length
              });

              if (items.length != 0) {
                while (items.length > 0) {
                  foursquare.syncItem(user, aspect, items.shift());
                  offset++;
                }

                syncNextPage();
              } else {
                logger.trace('finished starting foursquare items sync', { 
                  user_id: user.id, 
                  aspect: aspect
                });
              }
            } catch(error) {
              logger.warn('failed to parse foursquare items data', {
                error: error
              });
            }
          });
        }).on('error', function(error) {
          logger.warn('failed to retrieve next page of foursquare items', {
            error: error
          });
        });
      };

      syncNextPage();
    } catch (error) {
      logger.warn('failed to sync foursquare items', {
        error: error
      });
    }    
  }

  foursquare.syncItem = function(user, aspect, sourceItem) { 
    logger.trace('syncing foursquare item', { 
      user_id: user.id, 
      aspect: aspect,
      source_item_id: sourceItem.id
    });

    app.model.item.findOrCreate({
      user_id: user.id,
      storage_id: 'dropbox',
      source_id: 'foursquare',
      source_item_id: sourceItem.id,
      content_type_id: aspect.substring(0, aspect.length - 1)
    }, function(error, item) {
      if (error) {
        logger.warn('failed to find or create item', { 
          error: error 
        });
      } else {
        item.sync_attempted_at = Date.now();
        item.save(function(error) {
          if (error) {
            logger.warn('failed to update item with sync_attempted_at', { 
              error: error 
            });
          }
        });

        storages.dropbox.saveFile(
          user, 
          '/sources/foursquare/' + aspect + '/' + sourceItem.id + '.json',
          JSON.stringify(sourceItem),
          function(response) {
            logger.trace('synced foursquare item', { 
              user_id: user.id, 
              aspect: aspect,
              source_item_id: sourceItem.id,
              response: response
            });

            item.sync_verified_at = Date.now();
            item.bytes = response.bytes;
            item.path = response.path;
            item.save(function(error) {
              if (error) {
                logger.warn('failed to update item after syncing', { 
                  error: error
                });
              } else {
                logger.trace('updated item', { 
                  id: item.id 
                });
              }
            });
          },
          function(error) {
            logger.warn('syncing foursquare item failed', { 
              user_id: user.id, 
              aspect: aspect,
              source_item_id: sourceItem.id,
              message: error.message
            });

            item.sync_failed_at = Date.now();
            item.error = error.message;
            item.save(function(error) {
              if (error) {
                logger.warn('failed to update item after failure to sync', { 
                  error: error 
                });
              }
            });
          }
        );
      }
    });
  }

  passport.use(new foursquarePassport.Strategy({
      clientID: app.config.sources.foursquare.clientID,
      clientSecret: app.config.sources.foursquare.clientSecret,
      callbackURL: app.config.sources.foursquare.callbackURL,
      passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
      logger.trace('authenticating foursquare user', { foursquare_id: profile.id });

      req.user.sources.foursquare.id = profile.id;
      req.user.sources.foursquare.token = accessToken;
      req.user.save(function(error) {
        if (error) {
          logger.warn('failed to save foursquare ID and token to user', { 
            error: error
          });
        } else {
          logger.trace('saved foursquare ID and token to user', { 
            user_id: req.user.id 
          });
        }

        done(null, req.user);
      });
    }
  ));

  app.get('/sources/foursquare/auth', app.authFilter, function(req, res) {
    logger.trace('redirecting request to foursquare auth');
    passport.authenticate('foursquare')(req, res);
  });

  app.get('/sources/foursquare/auth-callback', app.authFilter, passport.authenticate('foursquare', { 
    failureRedirect: '/sources/foursquare/auth'
  }), function(req, res) {
    if (req.session.sourcesFoursquareAuthRedirectPath) {
      res.redirect(req.session.sourcesFoursquareAuthRedirectPath);
      req.session.sourcesFoursquareAuthRedirectPath = null;
    } else {
      res.redirect('/sources/foursquare');
    }
  });

  app.get('/sources/foursquare', app.authFilter, foursquare.authFilter, function(req, res) {
    items = app.model.item.find({
      user_id: req.user.id,
      source_id: 'foursquare'
    }, function(error, items) {
      if (error) {
        logger.warn('failed to get foursquare items', {
          error: error
        });

        res.json({
          error: 'failed to load foursquare info'
        });
      } else {
        res.json({
          foursquare: {
            total_items_available: items.length,
            total_items_synced: items.filter(function(item) { return (item.sync_verified_at); }).length,
            content_types: [{
              id: 'checkin',
              total_items_available: items.filter(function(item) { return (item.content_type_id == 'checkin'); }).length,
              total_items_synced: items.filter(function(item) { return (item.content_type_id == 'checkin' && item.sync_verified_at); }).length
            },
            {
              id: 'tip',
              total_items_available: items.filter(function(item) { return (item.content_type_id == 'tip'); }).length,
              total_items_synced: items.filter(function(item) { return (item.content_type_id == 'tip' && item.sync_verified_at); }).length
            },
            {
              id: 'friend',
              total_items_available: items.filter(function(item) { return (item.content_type_id == 'friend'); }).length,
              total_items_synced: items.filter(function(item) { return (item.content_type_id == 'friend' && item.sync_verified_at); }).length
            }]
          }
        });
      }
    });
  });

  app.get('/sources/foursquare/sync/:aspect', app.authFilter, foursquare.authFilter, function(req, res) {
    try {
      var aspect = req.params.aspect;
      foursquare.syncItems(req.user, aspect);
      res.json({ 
        msg: 'foursquare sync started',
        aspect: aspect
      });
    } catch (error) {
      logger.warn('failed to sync foursquare items', {
        aspect: aspect,
        error: error
      });

      res.json({ error: error.message });
    }
  });

  return foursquare;
}