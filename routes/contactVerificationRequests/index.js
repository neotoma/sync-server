var ContactVerificationRequest = require('../../models/contactVerificationRequest');
var NotificationRequest = require('../../models/notificationRequest');
var User = require('../../models/user');
var mailer = require('../../services/mailer');
var logger = require('../../lib/logger');
var async = require('async');

const crypto = require('crypto');
const CRYPTO_SIZE = 32; // number of bytes to generate during code generation

module.exports = function(app) {
  app.post('/contactVerificationRequests', function(req, res) {
    var attributes = req.body.data.attributes;
    var genericErrorCopy = 'For some reason, we were unable to send you an email. Please try submitting your address again.';

    ContactVerificationRequest.validate(attributes, function(errors, attributes) {
      if (errors) {
        return res.status(400).json(errors);
      }

      crypto.randomBytes(CRYPTO_SIZE, function(error, buffer) {
        if (error || !buffer) {
          logger.error('failed to generate code for new contactVerificationRequest');
          return res.status(500).send('500 Internal Server Error');
        }

        attributes.code = buffer.toString('hex');

        ContactVerificationRequest.findOrCreate(attributes, function(error, contactVerificationRequest) {
          if (error || !contactVerificationRequest) {
            logger.error('failed to find or create contactVerificationRequest');
            return res.status(500).send('500 Internal Server Error');
          }

          if (contactVerificationRequest.method === 'email') {
            mailer.sendMail({
              to: contactVerificationRequest.contact,
              subject: 'Please verify your email address to get notified about ' + process.env.SYNC_NAME,
              text: 'Thanks for submitting your email address to ' + process.env.SYNC_NAME + ' so we can notify you when it becomes available!\n\nHowever, before we can do so, we need you to confirm your address by visiting:\n\n' + contactVerificationRequest.clientHost + '/contactVerificationRequests/' + contactVerificationRequest._id + '?code=' + contactVerificationRequest.code + ' \n\n\nPlease take a second to do so!\n\nNote: If you weren\'t the one to submit your email address to us, don\'t worry; we won\'t contact you further about this matter. You can simply ignore this message.'
            }, function(error, mailerRes) {
              if (error) {
                logger.error('failed to send email for new contactVerificationRequest');
                return res.status(500).send(genericErrorCopy);
              }

              logger.trace('sent email for new contactVerificationRequest');

              return res.json(req.body);
            });
          } else {
            logger.error('failed to send code for new contactVerificationRequest given method');
            return res.status(500).send(genericErrorCopy);
          }
        });
      });
    });
  });

  app.put('/contactVerificationRequests/:id', function(req, res) {
    if (!req.body.data && !req.body.data.attributes) {
      res.status(400).send('data or data.attributes values missing from request body');
    }

    if (!req.body.data.attributes.id) {
      res.status(400).send('id value missing from request body');
    }

    if (!req.body.data.attributes.code) {
      res.status(400).send('code value missing from request body');
    }

    ContactVerificationRequest.findOne({
      _id: req.body.data.attributes.id,
      code: req.body.data.attributes.code
    }, function(error, contactVerificationRequest) {
      if (error || !contactVerificationRequest) {
        return res.status(404).send('No contact verification request found with attributes provided');
      }

      var verified = Boolean(req.body.data.attributes.verified);

      if (typeof req.body.data.attributes.verified !== 'undefined' && verified === true) {
        contactVerificationRequest.verified = verified;
        contactVerificationRequest.save(function(error) {
          if (error) {
            res.status(500).send('Unable to update contactVerificationRequest with verified value');
          }

          var createUser = function(callback) {
            if (contactVerificationRequest.createUser && contactVerificationRequest.method === 'email' && contactVerificationRequest.contact) {
              User.findOrCreate({
                email: contactVerificationRequest.contact
              }, function(error, user) {
                if (error || !user) {
                  error.message = 'Unable to find or create user after verifying contact';
                }

                callback(error, user);
              });
            } else {
              callback(null, null);
            }
          }

          var createNotificationRequests = function(user, callback) {
            if (user && contactVerificationRequest.createNotificationRequests) {
              async.each(contactVerificationRequest.createNotificationRequests, function(notificationRequestAttributes, callback) {
                NotificationRequest.findOrCreate({
                  userId: user.id,
                  event: notificationRequestAttributes.event
                }, function(error, notificationRequest) {
                  callback(error);
                });
              }, function(error) {
                if (error) {
                  error.message = 'Unable to create notification requests after verifying contact';
                }

                callback(error, user);
              });
            } else {
              callback(null, user);
            }
          };

          var createSession = function(user, callback) {
            if (user) {
              req.logIn(user, function(error) {
                if (error) {
                  error.message = 'Unable to create session after verifying contact';
                } else {
                  logger.trace('session created after verifying contact');
                }

                callback(error, user);
              });
            } else {
              callback(null, user);
            }
          };

          async.waterfall([createUser, createNotificationRequests, createSession], function(error) {
            if (error) {
              logger.error(error.message);
              res.status(500).send(error.message);
            } else {
              res.json({
                'data': {
                  'type': 'contactVerificationRequest',
                  'attributes': contactVerificationRequest.toObject()
                }
              });
            }
          });
        });
      } else {
        res.status(400).send('verified attribute not provided or value not true');
      }
    });
  });
}