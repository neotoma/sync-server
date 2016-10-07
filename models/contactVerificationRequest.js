var ModelFactory = require('../factories/model');
var mailer = require('../lib/mailer');
var supportedMethods = ['email'];

var staticMethods = {
  validate: function(attributes, callback) {
    var errors = [];
    var newAttributes = {};

    if (typeof(attributes.method) === 'undefined') {
      errors.push(new Error('Required method value missing'));
    } else if (supportedMethods.indexOf(attributes.method) === -1) {
      errors.push(new Error('Invalid method value'));
    } else {
      newAttributes.method = attributes.method;
    }

    if (typeof(attributes.contact) === 'undefined') {
      errors.push(new Error('Required contact value missing'));
    } else if (!mailer.isValidEmail(attributes.contact)) {
      errors.push(new Error('Invalid contact value'));
    } else {
      newAttributes.contact = attributes.contact;
    }

    if (attributes.code) {
      newAttributes.code = attributes.code;
    }

    if (attributes.createUser && typeof(attributes.createUser) !== 'boolean') {
      errors.push(new Error('Invalid createUser value'));
    } else {
      newAttributes.createUser = attributes.createUser;
    }

    if (attributes.authenticateSession && typeof(attributes.authenticateSession) !== 'boolean') {
      errors.push(new Error('Invalid authenticateSession value'));
    } else {
      newAttributes.authenticateSession = attributes.authenticateSession;
    }

    if (['undefined', 'object'].indexOf(typeof(attributes.createNotificationRequests)) === -1) {
      errors.push(new Error('Invalid createNotificationRequests value'));
    } else if (typeof(attributes.createNotificationRequests) === 'object') {
      attributes.createNotificationRequests.forEach(function(notificationRequest) {
        if (typeof(notificationRequest.event) === 'undefined') {
          errors.push(new Error('Invalid notificationRequest value'));
        }
      });

      newAttributes.createNotificationRequests = attributes.createNotificationRequests;
    } 

    if (typeof(attributes.clientOrigin) === 'undefined') {
      errors.push(new Error('Required clientOrigin value missing'));
    } else if (typeof attributes.clientOrigin !== 'string') {
      errors.push(new Error('Invalid clientOrigin value'));
    } else {
      newAttributes.clientOrigin = attributes.clientOrigin;
    }

    if (errors.length > 0) {
      callback(errors);
    } else {
      callback(null, newAttributes);
    }
  }
};

module.exports = ModelFactory.new('contactVerificationRequest', {
  method: { type: String, required: true }, // method of contact, e.g. email
  contact: { type: String, required: true }, // contact identifier, e.g. example@example.com
  code: String, // code delivered to contact for verification, e.g. 1234567890
  createUser: { type: Boolean, default: false }, // whether to create a user upon verification
  authenticateSession: { type: Boolean, default: false }, // whether to create a session upon verification
  createNotificationRequests: Array, // array of JSON objects for notification requests to create upon verification
  clientOrigin: String, // host URL of client used to make request
  verified: { type: Boolean, default: false }, // whether contact has been verified
  userId: String
}, staticMethods);