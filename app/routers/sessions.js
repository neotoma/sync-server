var async = require('async');
var UserSourceAuth = require('app/models/userSourceAuth');
var UserStorageAuth = require('app/models/userStorageAuth');

module.exports = function(app) {
  var jsonapi = require('app/lib/jsonapi')(app);

  jsonapi.routeResource(app, 'get', '/sessions', undefined, function(req, res) {
    var data;
    var included = [];
    var userObject;

    var populateSessions = function(done) {
      data = [{
        id: req.session.id,
        type: 'sessions'
      }];

      done();
    };

    var initUserObject = function(done) {
      if (!req.user) { return done(); }

      userObject = res.resourceObjectFromDocument(req.user);
      done();
    };

    var populateObjectsForUser = function(model) {
      return function(done) {
        if (!req.user) { return done(); }

        model.find({
          user: req.user.id
        }, function(error, documents) {
          async.each(documents, function(document, done) {
            included.push(res.resourceObjectFromDocument(document));
            res.addRelationshipToResourceObject(userObject, document, model.modelType());
            done();
          }, done);
        });
      };
    };

    var populateUsers = function(done) {
      if (req.user) {
        data[0].relationships = {
          users: {
            data: [{
              id: req.user.id,
              type: 'users'
            }]
          }
        };

        included.push(userObject);
      }

      done();
    };

    async.series([
      populateSessions,
      initUserObject,
      populateObjectsForUser(UserStorageAuth),
      populateObjectsForUser(UserSourceAuth),
      populateUsers
    ], function(error) {
      if (error) {
        res.sendError(error);
      } else {
        res.sendData(data, included);
      }
    });
  });

  jsonapi.routeResource(app, 'delete', '/sessions/:id', { validateRequestUrl: false }, function(req, res) {
    if (req.params.id === req.session.id) {
      req.session.destroy(function(error) {
        if (error) {
          res.sendError(error);
        } else {
          res.sendStatus(204);
        }
      });
    } else {
      res.sendNotFound();
    }
  });
};