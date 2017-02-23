/**
 * ContactVerificationRequest model
 * @module
 */

var async = require('async');
var crypto = require('crypto');
var logger = require('../lib/logger');
var mailer = require('../lib/mailer');
var modelFactory = require('../factories/model');

/**
 * Represents request to verify contact information
 * @class ContactVerificationRequest
 * @property {boolean} [authenticateSession=false] - Whether to authenticate the client's session upon verification
 * @property {string} clientOrigin - Origin URL of client that requested contact verification (e.g. "https://example.com")
 * @property {string} [code] - Secure code generated to fulfill request
 * @property {string} contact - Contact identifier used to send request using method (e.g. "user@example.com")
 * @property {Object[]} [createNotificationRequests] - Array of properties for notification requests to create related to user upon verification
 * @property {event} createNotificationRequests[].event - Event for new notification request
 * @property {boolean} [createUser=false] - Whether to create a user upon verification if one doesn't already exist with matching contact info
 * @property {string} method - Method used to send request to contact (e.g. "email")
 * @property {boolean} [verified=false] - Whether document has been verified 
 */
module.exports = modelFactory.new('ContactVerificationRequest', {
  authenticateSession: { type: Boolean, default: false },
  clientOrigin: { type: String, required: true },
  code: String,
  contact: {
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        return mailer.isValidEmail(value);
      },
      message: '"{VALUE}" is not a supported contact value'
    }
  },
  createNotificationRequests: {
    type: Array,
    validate: {
      validator: function(value) {
        try {
          if (['undefined', 'object'].indexOf(typeof value) === -1) {
            throw new Error('Invalid value found');
          } else if (typeof value === 'object') {
            value.forEach(function(notificationRequest) {
              if (typeof notificationRequest.event === 'undefined') {
                throw new Error('Invalid notificationRequest found');
              }
            });
          }

          return true;
        } catch (error) {
          return false;
        }
      },
      message: '"{VALUE}" is not a supported createNotificationRequests value'
    }
  },
  createUser: { type: Boolean, default: false },
  method: {
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        return (['email'].indexOf(value) > -1);
      },
      message: '"{VALUE}" is not a supported method value'
    }
  },
  verified: { type: Boolean, default: false }
}, {
  jsonapi: {
    get: 'admin',
    patch: 'admin',
    post: {
      allowed: 'public',
      queryConditions: {
        code: undefined
      },

      /**
       * Generate and deliver verification code after POST
       * @param {Object} req - Express request object
       * @param {Object} res - Express response object
       * @param {Object} contactVerificationRequest - Mongoose contactVerificationRequest document created by POST request
       * @param {function} done - Callback function expecting error, res, req and contactVerificationRequest params
       */
      post: function(req, res, contactVerificationRequest, done) {
        var generateCodeAndSave = (done) => {
          crypto.randomBytes(32, (error, buffer) => {
            if (error) {
              return done(new Error(`Failed to generate code: ${error.message}`));
            }

            contactVerificationRequest.code = buffer.toString('hex');
            contactVerificationRequest.save(done);
          });
        };

        var deliverCode = (done) => {
          if (contactVerificationRequest.method === 'email') {
            mailer.sendMail({
              to: contactVerificationRequest.contact,
              subject: 'Please verify your email address to get notified about ' + process.env.SYNC_SERVER_NAME,
              text: 'Thanks for submitting your email address to ' + process.env.SYNC_SERVER_NAME + ' so we can notify you when it becomes available!\n\nHowever, before we can do so, we need you to confirm your address by visiting:\n\n' + contactVerificationRequest.clientOrigin + '/contactVerificationRequests/' + contactVerificationRequest._id + '?code=' + contactVerificationRequest.code + ' \n\n\nPlease take a second to do so!\n\nNote: If you weren\'t the one to submit your email address to us, don\'t worry; we won\'t contact you further about this matter. You can simply ignore this message.'
            }, function(error) {
              if (error) {
                logger.error('ContactVerificationRequest model failed to send email for new contactVerificationRequest', {
                  contactVerificationRequestId: contactVerificationRequest.id,
                  error: error.message 
                });
              } else {
                logger.milestone('ContactVerificationRequest model sent email for new contactVerificationRequest', {
                  contactVerificationRequestId: contactVerificationRequest.id
                });
              }

              done();
            });
          }
        };

        async.series([
          generateCodeAndSave,
          deliverCode
        ], function(error) {
          if (error) {
            logger.error('ContactVerificationRequest model post-POST procedure failed', { error: error.message });
          }

          done(error, req, res, contactVerificationRequest);
        });
      }
    }
  }
});