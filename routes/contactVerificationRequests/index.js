var ContactVerificationRequest = require('../../models/contactVerificationRequest');
var NotificationRequest = require('../../models/notificationRequest');
var User = require('../../models/user');
var mailer = require('../../lib/mailer');
var logger = require('../../lib/logger');
var async = require('async');

const crypto = require('crypto');
const CRYPTO_SIZE = 32; // number of bytes to generate during code generation

var errorMessages = function(errors) {
  return errors.map(function(error) { return error.message; })
};

module.exports = function(app) {
  app.post('/contactVerificationRequests', function(req, res) {
    if (!req.body.data || !req.body.data.attributes) {
      return res.status(400).send('Data or data.attributes not provided in body of request');
    }

    var attributes = req.body.data.attributes;
    var genericErrorCopy = 'For some reason, we were unable to send you an email. Please try submitting your address again.';

    ContactVerificationRequest.validate(attributes, function(errors, attributes) {
      if (errors) {
        logger.error('App failed to validate attributes for new contactVerificationRequest', { errors: errorMessages(errors) });
        return res.status(400).json(errorMessages(errors));
      }

      crypto.randomBytes(CRYPTO_SIZE, function(error, buffer) {
        if (error || !buffer) {
          logger.error('App failed to generate code for new contactVerificationRequest');
          return res.status(500).send('500 Internal Server Error');
        }

        attributes.code = buffer.toString('hex');

        ContactVerificationRequest.findOrCreate(attributes, function(error, contactVerificationRequest) {
          if (error || !contactVerificationRequest) {
            logger.error('App failed to find or create contactVerificationRequest');
            return res.status(500).send('500 Internal Server Error');
          }

          if (contactVerificationRequest.method === 'email') {
            mailer.sendMail({
              to: contactVerificationRequest.contact,
              subject: 'Please verify your email address to get notified about ' + process.env.SYNC_NAME,
              text: 'Thanks for submitting your email address to ' + process.env.SYNC_NAME + ' so we can notify you when it becomes available!\n\nHowever, before we can do so, we need you to confirm your address by visiting:\n\n' + contactVerificationRequest.clientOrigin + '/contactVerificationRequests/' + contactVerificationRequest._id + '?code=' + contactVerificationRequest.code + ' \n\n\nPlease take a second to do so!\n\nNote: If you weren\'t the one to submit your email address to us, don\'t worry; we won\'t contact you further about this matter. You can simply ignore this message.'
            }, function(error, mailerRes) {
              if (error) {
                logger.error('App failed to send email for new contactVerificationRequest', { reason: error.message });
                return res.status(500).send(genericErrorCopy);
              }

              logger.milestone('App sent email for new contactVerificationRequest', {
                contactVerificationRequestId: contactVerificationRequest.id,
                to: contactVerificationRequest.contact
              });

              req.body.id = contactVerificationRequest.id;

              return res.status(201).json(req.body);
            });
          } else {
            logger.error('App failed to send code for new contactVerificationRequest given method');
            return res.status(500).send(genericErrorCopy);
          }
        });
      });
    });
  });

  app.put('/contactVerificationRequests/:id', function(req, res) {
    try {
      if (!req.body.data && !req.body.data.attributes) {
        throw new Error('data or data.attributes values missing from request body');
      }

      if (!req.body.data.id) {
        throw new Error('id value missing from request body');
      }

      if (!req.body.data.attributes.code) {
        throw new Error('code value missing from request body');
      }

      if (Boolean(req.body.data.attributes.verified) !== true) {
        throw new Error('verified attribute not provided or value not true');
      }
    } catch (error) {
      logger.error('App encountered bad request when processing PUT /contactVerificationRequests/:id', { reason: error.message });
      return res.status(400).send(error.message);
    }

    ContactVerificationRequest.findOne({
      _id: req.body.data.id,
      code: req.body.data.attributes.code
    }, function(error, contactVerificationRequest) {
      if (error || !contactVerificationRequest) {
        return res.status(404).send('No contact verification request found with attributes provided');
      }

      contactVerificationRequest.verified = Boolean(req.body.data.attributes.verified);
      contactVerificationRequest.save(function(error) {
        if (error) {
          res.status(500).send('Unable to update contactVerificationRequest with verified value');
        }

        var createUser = function(callback) {
          if (contactVerificationRequest.method === 'email' && contactVerificationRequest.contact) {
            if (contactVerificationRequest.createUser) {
              User.findOrCreate({
                email: contactVerificationRequest.contact
              }, function(error, user) {
                var errorMessage = 'Unable to find or create user after verifying contact';
                if (error) {
                  error.message = errorMessage;
                  return callback(error);
                } else if (!user) {
                  error = new Error(errorMessage);
                  return callback(error);
                }

                contactVerificationRequest.userId = user.id;
                contactVerificationRequest.save(function(error) {
                  callback(error, user);
                });
              });
            } else if (contactVerificationRequest.authenticateSession) {
              User.findOne({
                email: contactVerificationRequest.contact
              }, function(error, user) {
                var errorMessage = 'Unable to find user after verifying contact';
                if (error) {
                  error.message = errorMessage;
                  return callback(error);
                } else if (!user) {
                  error = new Error(errorMessage);
                  return callback(error);
                }

                contactVerificationRequest.userId = user.id;
                contactVerificationRequest.save(function(error) {
                  callback(error, user);
                });
              });
            } else {
              callback(null, null);
            }
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

        var authenticateSession = function(user, callback) {
          if (user && contactVerificationRequest.authenticateSession) {
            req.logIn(user, function(error) {
              if (error) {
                error.message = 'Unable to authenticate session after verifying contact';
              } else {
                logger.trace('Session authenticated after verifying contact');
              }

              callback(error, user);
            });
          } else {
            callback(null, user);
          }
        };

        async.waterfall([createUser, createNotificationRequests, authenticateSession], function(error, user) {
          if (error) {
            logger.error(error.message);
            res.status(500).send(error.message);
          } else {
            var meta = {
              contactVerificationRequestId: contactVerificationRequest.id
            };

            if (user) {
              meta.userId = user.id;
              meta.userEmail = user.email;
            }

            logger.milestone('App verified contactVerificationRequest', meta);

            res.json({
              'data': {
                'type': 'contactVerificationRequest',
                'attributes': contactVerificationRequest.toObject()
              }
            });
          }
        });
      });
    });
  });
}