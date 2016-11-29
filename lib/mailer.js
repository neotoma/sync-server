var logger = require('./logger');
var nodemailer = require('nodemailer');
var sendGridTransport = require('nodemailer-sendgrid-transport');
var stubTransport = require('nodemailer-stub-transport');

var mailer = {};

mailer.sendMail = function(email, callback) {
  try {
    if (!process.env.SYNC_SERVER_NAME) {
      throw new Error('Mailer failed to find app name variable in environment');
    }

    if (!process.env.SYNC_SERVER_MAILER_SENDER_EMAIL) {
      throw new Error('Mailer failed to find sender email variable in environment');
    }

    email.from = process.env.SYNC_SERVER_NAME + '<' + process.env.SYNC_SERVER_MAILER_SENDER_EMAIL + '>';

    if (logger.trace) {
      logger.trace('Mailer sending email in ' + process.env.SYNC_SERVER_ENV + ' environment', { email: email });
    }

    if (process.env.SYNC_SERVER_ENV === 'production' || (process.env.SYNC_SERVER_ENV === 'development' && email.to === process.env.SYNC_SERVER_MAILER_DEV_RECIPIENT_EMAIL)) {
      if (!process.env.SYNC_SERVER_SENDGRID_API_KEY) {
        throw new Error('Mailer failed to find SendGrid API key variable in environment');
      }

      var transport = nodemailer.createTransport(sendGridTransport({
        auth: {
          api_key: process.env.SYNC_SERVER_SENDGRID_API_KEY
        }
      }));

      transport.sendMail(email, callback);
    } else {
      var transport = nodemailer.createTransport(stubTransport());
      transport.sendMail(email, callback);
    }
  } catch (error) {
    if (logger.error) {
      logger.error(error.message, { email: email });
    }

    callback(error);
  }
}

mailer.isValidEmail = function(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

module.exports = mailer;