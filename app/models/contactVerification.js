/**
 * ContactVerification model
 * @module
 */

var async = require('async');
var ContactVerificationRequest = require('./contactVerificationRequest');
var debug = require('debug')('syncServer:contactVerification');
var logger = require('../lib/logger');
var modelFactory = require('../factories/model');
var NotificationRequest = require('./notificationRequest');
var User = require('./user');

/**
 * Represents verification of contact information
 * @class ContactVerification
 * @global
 * @property {string} contactVerificationRequestCode - Secure code initially generated by ContactVerificationRequest
 * @property {module:models/contactVerificationRequest~ContactVerificationRequest} contactVerificationRequest - Verified contactVerificationRequest 
 * @property {module:models/user~User} [user] - User who verified contact
 */
module.exports = modelFactory.new('ContactVerification', {
  contactVerificationRequestCode: { type: String, required: true },
  contactVerificationRequest: { ref: 'ContactVerificationRequest', required: true },
  user: { ref: 'User' }
}, {
  jsonapi: {
    delete: 'admin',
    get: 'admin',
    patch: 'admin',
    post: {
      allowed: 'public',

      /**
       * Authenticate user after POST if related contactVerificationRequest indicates to do so
       * @param {Object} req - Express request object
       * @param {Object} res - Express response object
       * @param {Object} contactVerification - Mongoose contactVerification document created by POST request
       * @param {function} done - Callback function expecting error, res, req and contactVerification params
       */
      post: function(req, res, contactVerification, done) {
        if (contactVerification.user && contactVerification.contactVerificationRequest.authenticateSession) {
          req.logIn(contactVerification.user, function(error) {
            if (!error) {
              logger.info('contactVerification model post-POST procedure authenticated session');
            } else {
              logger.error('contactVerification model post-POST procedure failed to authenticate session');
            }

            done(error);
          });
        } else {
          done();
        }
      }
    }
  }
}, null, function(schema) {
  schema.pre('save', function(next) {
    if (!this.isNew) { return next(); }

    debug('pre save ContactVerificationRequest.findOne %s, code: %s', this.contactVerificationRequest, this.contactVerificationRequestCode);

    ContactVerificationRequest.findOne({
      _id: this.contactVerificationRequest,
      code: this.contactVerificationRequestCode
    }, function(error, contactVerificationRequest) {
      if (error) {
        next(error);
      } else if (!contactVerificationRequest) {
        next(new Error('Unable to find corresponding contactVerificationRequest by ID and code'));
      } else {
        next();
      }
    });
  });

  schema.post('save', function(contactVerification, next) {
    if (!this.wasNew) { return next(); }

    var findContactVerificationRequest = (done) => {
      ContactVerificationRequest.findOne({
        _id: this.contactVerificationRequest,
        code: this.contactVerificationRequestCode
      }, function(error, contactVerificationRequest) {
        if (error) {
          return done(error);
        } else if (!contactVerificationRequest) {
          return done(new Error('Unable to find corresponding contactVerificationRequest'));
        }

        return done(null, contactVerificationRequest);
      });
    };

    var updateContactVerificationRequestVerified = (contactVerificationRequest, done) => {
      contactVerificationRequest.verified = true;
      contactVerificationRequest.save(function(error, contactVerificationRequest) {
        done(error, contactVerificationRequest)
      });
    };

    var findOrCreateUser = (contactVerificationRequest, done) => {
      if (contactVerificationRequest.method === 'email' && contactVerificationRequest.contact && (contactVerificationRequest.createUser || contactVerificationRequest.authenticateSession)) {
        var query = User.findOne;

        if (contactVerificationRequest.createUser) {
          query = User.findOrCreate;
        }

        query.apply(User, [{
          email: contactVerificationRequest.contact
        }, function(error, user) {
          if (error) {
            return done(error);
          } else if (!user) {
            return done(new Error('Unable to find or create user'));
          }

          contactVerification.user = user;
          contactVerification.save(function(error) {
            done(error, user, contactVerificationRequest);
          });
        }]);
      } else {
        done(null, null, contactVerificationRequest);
      }
    }

    var createNotificationRequests = (user, contactVerificationRequest, done) => {
      if (user && contactVerificationRequest.createNotificationRequests) {
        async.each(contactVerificationRequest.createNotificationRequests, function(notificationRequestAttributes, done) {
          NotificationRequest.findOrCreate({
            user: user,
            event: notificationRequestAttributes.event
          }, done);
        }, function(error) {
          done(error, user, contactVerificationRequest);
        });
      } else {
        done(null, user, contactVerificationRequest);
      }
    };

    var logMilestone = (user, contactVerificationRequest, done) => {
      var meta = {
        contactVerificationRequestId: contactVerificationRequest.id
      };

      if (user) {
        meta.userId = user.id;
        meta.userEmail = user.email;
      }

      logger.milestone('ContactVerification model verified contactVerificationRequest', meta);
      done();
    };

    async.waterfall([
      findContactVerificationRequest,
      updateContactVerificationRequestVerified,
      findOrCreateUser, 
      createNotificationRequests,
      logMilestone
    ], function(error) {
      if (error) {
        logger.error('ContactVerification model post-save procedure failed', { error: error.message });
      }

      next(error);
    });
  });
});