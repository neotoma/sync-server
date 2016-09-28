var ModelFactory = require('../factories/model');

var staticMethods = {
  'cleanseAttributes': function(attributes, callback) {
    var isValidEmail = function(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }

    var supportedMethods = [
      'email'
    ];

    var errors = [];

    if (typeof(attributes.method) === 'undefined') {
      errors.push('Required method value missing');
    } else if (supportedMethods.indexOf(attributes.method) === -1) {
      errors.push('Unsupported method value');
    }

    if (typeof(attributes.contact) === 'undefined') {
      errors.push('Required contact value missing');
    } else if (!isValidEmail(attributes.contact)) {
      errors.push('Invalid contact value');
    }

    if (['undefined', 'boolean'].indexOf(typeof(attributes.createUser)) === -1) {
      errors.push('Invalid createUser value');
    }

    if (['undefined', 'boolean'].indexOf(typeof(attributes.createSession)) === -1) {
      errors.push('Invalid createSession value');
    }

    if (['undefined', 'object'].indexOf(typeof(attributes.createNotificationRequests)) === -1) {
      errors.push('Invalid createNotificationRequests value provided');
    } else if (typeof(attributes.createNotificationRequests) === 'object') {
      attributes.createNotificationRequests.forEach(function(notificationRequest) {
        if (typeof(notificationRequest.event) === 'undefined') {
          errors.push('Invalid notificationRequest value');
        }
      });
    }

    if (['undefined', 'string'].indexOf(typeof(attributes.clientHost)) === -1) {
      errors.push('Invalid clientHost value');
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
  method: String, // method of contact, e.g. email
  contact: String, // contact identifier, e.g. example@example.com
  code: String, // code delivered to contact for verification, e.g. 1234567890
  createUser: Boolean, // whether to create a user upon verification
  createSession: Boolean, // whether to create a session upon verification
  createNotificationRequests: Array, // array of JSON objects for notification requests to create upon verification
  clientHost: String, // host URL of client used to make request
  verified: Boolean // whether contact has been verified
}, staticMethods);