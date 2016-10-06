var logger = require('./logger');
var nodemailer = require('nodemailer');
var sendGridTransport = require('nodemailer-sendgrid-transport');
var mailer = {};

mailer.sendMail = function(email, callback) {
  try {
    if (!process.env.SYNC_SENDGRID_API_KEY) {
      throw new Error('Mailer failed to find SendGrid API key variable in environment');
    }

    if (!process.env.SYNC_NAME) {
      throw new Error('Mailer failed to find app name variable in environment');
    }

    if (!process.env.SYNC_MAILER_SENDER_EMAIL) {
      throw new Error('Mailer failed to find sender email variable in environment');
    }

    var transporter = nodemailer.createTransport(sendGridTransport({
      auth: {
        api_key: process.env.SYNC_SENDGRID_API_KEY
      }
    }));

    email.from = process.env.SYNC_NAME + '<' + process.env.SYNC_MAILER_SENDER_EMAIL + '>';

    if (process.env.NODE_ENV === 'production') {
      transporter.sendMail(email, callback);
    } else if (process.env.NODE_ENV === 'development') {
      if (email.to === process.env.SYNC_MAILER_DEV_RECIPIENT_EMAIL) {
        transporter.sendMail(email, callback);
      } else {
        throw new Error('Mailer failed to send email in development environment because recipient did not match whitelisted address');
      }
    } else {
      throw new Error('Mailer failed to send email because ' + process.env.NODE_ENV + ' environment not supported');
    }
  } catch (error) {
    logger.error(error.message);
    callback(error);
  }
}

mailer.isValidEmail = function(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

module.exports = mailer;