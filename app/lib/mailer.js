var debug = require('./debug')('app:mailer');
var logger = require('./logger');
var nodemailer = require('nodemailer');
var sendGridTransport = require('nodemailer-sendgrid-transport');
var stubTransport = require('nodemailer-stub-transport');

var mailer = {
  emailRegex: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ // eslint-disable-line
};

mailer.sendMail = function(email, done) {
  try {
    var senderEmail = process.env.SYNC_SERVER_MAILER_SENDER_EMAIL;
    var serverName = process.env.SYNC_SERVER_NAME ? process.env.SYNC_SERVER_NAME : 'Neotoma';

    if (!senderEmail) {
      debug('Sending mail aborted due to lack of SYNC_SERVER_MAILER_SENDER_EMAIL environment variable');
      return done();
    }

    email.from = `${serverName}<${senderEmail}>`;

    if (logger.trace) {
      logger.trace('Mailer sending email', { email: email });
    }

    if (process.env.SYNC_SERVER_SENDGRID_API_KEY && (!process.env.SYNC_SERVER_MAILER_RECIPIENT_EMAIL || email.to === process.env.SYNC_SERVER_MAILER_RECIPIENT_EMAIL)) {
      var transport = nodemailer.createTransport(sendGridTransport({
        auth: {
          api_key: process.env.SYNC_SERVER_SENDGRID_API_KEY
        }
      }));

      transport.sendMail(email, (error) => {
        if (!error) {
          debug.success('sent mail with SendGrid to %s: %s', email.to, email.text);
        } else {
          debug.error('failed to send mail with SendGrid: %s', error.message);
        }

        done(error);
      });
    } else {
      nodemailer.createTransport(stubTransport()).sendMail(email, done);
    }
  } catch (error) {
    if (logger.error) {
      logger.error(error.message, { email: email });
    }

    done(error);
  }
};

mailer.isValidEmail = function(email) {
  return this.emailRegex.test(email);
};

module.exports = mailer;
