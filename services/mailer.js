var nodemailer = require('nodemailer');
var sendGridTransport = require('nodemailer-sendgrid-transport');

var mailer = {};

var transporter = nodemailer.createTransport(sendGridTransport({
  auth: {
    api_key: process.env.SYNC_SENDGRID_API_KEY
  }
}));

mailer.sendMail = function(email, callback) {
  email.from = process.env.SYNC_NAME + '<' + process.env.SYNC_MAILER_EMAIL + '>';
  transporter.sendMail(email, callback);
}

mailer.isValidEmail = function(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

module.exports = mailer;