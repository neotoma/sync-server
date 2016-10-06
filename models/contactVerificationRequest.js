var ModelFactory = require('../factories/model');
var mailer = require('../lib/mailer');
var supportedMethods = ['email'];

var staticMethods = {
  validate: function(attributes, callback) {
    var errors = [];

    if (typeof(attributes.method) === 'undefined') {
      errors.push(new Error('Required method value missing'));
    } else if (supportedMethods.indexOf(attributes.method) === -1) {
      errors.push(new Error('Invalid method value'));
    }

    if (typeof(attributes.contact) === 'undefined') {
      errors.push(new Error('Required contact value missing'));
    } else if (!mailer.isValidEmail(attributes.contact)) {
      errors.push(new Error('Invalid contact value'));
    }

    if (typeof(attributes.createUser) !== 'boolean') {
      errors.push(new Error('Invalid createUser value'));
    }

    if (typeof(attributes.createSession) !== 'boolean') {
      errors.push(new Error('Invalid createSession value'));
    }

    if (['undefined', 'object'].indexOf(typeof(attributes.createNotificationRequests)) === -1) {
      errors.push(new Error('Invalid createNotificationRequests value'));
    } else if (typeof(attributes.createNotificationRequests) === 'object') {
      attributes.createNotificationRequests.forEach(function(notificationRequest) {
        if (typeof(notificationRequest.event) === 'undefined') {
          errors.push(new Error('Invalid notificationRequest value'));
        }
      });
    }

    if (typeof(attributes.clientHost) === 'undefined') {
      errors.push(new Error('Required clientHost value missing'));
    } else if (typeof attributes.clientHost !== 'string') {
      errors.push(new Error('Invalid clientHost value'));
    }

    if (errors.length > 0) {
      callback(errors);
    } else {
      callback(null, {
        method: attributes.method,
        contact: attributes.contact,
        code: attributes.code,
        createUser: attributes.createUser,
        createSession: attributes.createSession,
        createNotificationRequests: attributes.createNotificationRequests,
        clientHost: attributes.clientHost
      });
    }
  }
};

module.exports = ModelFactory.new('contactVerificationRequest', {
  method: { type: String, required: true }, // method of contact, e.g. email
  contact: { type: String, required: true }, // contact identifier, e.g. example@example.com
  code: String, // code delivered to contact for verification, e.g. 1234567890
  createUser: { type: Boolean, default: false }, // whether to create a user upon verification
  createSession: { type: Boolean, default: false }, // whether to create a session upon verification
  createNotificationRequests: Array, // array of JSON objects for notification requests to create upon verification
  clientHost: String, // host URL of client used to make request
  verified: { type: Boolean, default: false } // whether contact has been verified
}, staticMethods);