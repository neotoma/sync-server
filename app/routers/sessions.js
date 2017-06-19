var app = require('app');
var async = require('async');
var jsonapi = require('app/lib/jsonapi');
var UserSourceAuth = require('app/models/userSourceAuth');
var UserStorageAuth = require('app/models/userStorageAuth');

module.exports = {
  routeResources() {
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

        userObject = jsonapi.resourceObjectFromDocument(req.user);
        done();
      };

      var populateObjectsForUser = function(model) {
        return function(done) {
          if (!req.user) { return done(); }

          model.find({
            user: req.user.id
          }, function(error, documents) {
            async.each(documents, function(document, done) {
              included.push(jsonapi.resourceObjectFromDocument(document));
              jsonapi.addRelationshipToResourceObject(userObject, document, model.modelType());
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
          jsonapi.sendError(res, error);
        } else {
          jsonapi.sendData(res, data, included);
        }
      });
    });

    jsonapi.routeResource(app, 'delete', '/sessions/:id', undefined, function(req, res) {
      if (req.params.id === req.session.id) {
        req.session.destroy(function(error) {
          if (error) {
            jsonapi.sendError(res, error);
          } else {
            res.sendStatus(204);
          }
        });
      } else {
        jsonapi.sendNotFound(res);
      }
    });
  }
};