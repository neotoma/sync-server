var db = require('../db');
var wh = require('../warehouse/contactVerificationRequest');
var assert = require('assert');
var ContactVerificationRequest = require('../../models/contactVerificationRequest');
var mongoose = require('../../lib/mongoose');
require('../../lib/prototypes/object.js');

describe('new contactVerificationRequest', function() {
  before(db.clear);
  
  before(function() {
    this.contactVerificationRequest = new ContactVerificationRequest(wh.attributes);
  });

  it('has method', function() {
    assert.equal(this.contactVerificationRequest.method, wh.attributes.method);
  });

  it('has contact', function() {
    assert.equal(this.contactVerificationRequest.contact, wh.attributes.contact);
  });

  it('has code', function() {
    assert.equal(this.contactVerificationRequest.code, wh.attributes.code);
  });

  it('has createUser', function() {
    assert.equal(this.contactVerificationRequest.createUser, wh.attributes.createUser);
  });

  it('has authenticateSession', function() {
    assert.equal(this.contactVerificationRequest.authenticateSession, wh.attributes.authenticateSession);
  });

  it('has createNotificationRequests', function() {
    assert.equal(this.contactVerificationRequest.createNotificationRequests[0].event, wh.attributes.createNotificationRequests[0].event);
  });

  it('has clientOrigin', function() {
    assert.equal(this.contactVerificationRequest.clientOrigin, wh.attributes.clientOrigin);
  });

  it('has verified', function() {
    assert.equal(this.contactVerificationRequest.verified, wh.attributes.verified);
  });

  it('can save and have id, timestamps', function(done) {
    var self = this;
    var contactVerificationRequest = this.contactVerificationRequest;

    this.contactVerificationRequest.save(function(error) {
      assert.equal(typeof contactVerificationRequest.id, 'string');
      assert(contactVerificationRequest.createdAt);
      assert(contactVerificationRequest.updatedAt);

      self._id = contactVerificationRequest._id;
      self.createdAt = contactVerificationRequest.createdAt;
      self.updatedAt = contactVerificationRequest.updatedAt;

      done(error);
    });
  });

  it('has toObject', function() {
    var object = this.contactVerificationRequest.toObject();
    assert.equal(object.id, this._id);
    assert.equal(object.method, wh.attributes.method);
    assert.equal(object.contact, wh.attributes.contact);
    assert.equal(object.code, wh.attributes.code);
    assert.equal(object.createUser, wh.attributes.createUser);
    assert.equal(object.authenticateSession, wh.attributes.authenticateSession);
    assert.equal(object.createNotificationRequests[0].event, wh.attributes.createNotificationRequests[0].event);
    assert.equal(object.clientOrigin, wh.attributes.clientOrigin);
    assert.equal(object.verified, wh.attributes.verified);
    assert.equal(object.userId, wh.attributes.userId);
    assert.deepEqual(object.createdAt.toString(), this.createdAt.toString());
    assert.deepEqual(object.updatedAt.toString(), this.updatedAt.toString());
  });

  it('can be found with findOrCreate', function(done) {
    var self = this;
    ContactVerificationRequest.findOrCreate(wh.attributes, function(error, contactVerificationRequest) {
      assert.equal(contactVerificationRequest.id, self.contactVerificationRequest.id);
      done(error);
    });
  });

  it('can be created with findOrCreate', function(done) {
    var newContactVerificationRequestAttributes = Object.clone(wh.attributes);
    newContactVerificationRequestAttributes.method = 'phone';

    var self = this;
    ContactVerificationRequest.findOrCreate(newContactVerificationRequestAttributes, function(error, contactVerificationRequest) {
      assert.equal(typeof contactVerificationRequest.id, 'string');
      assert.notEqual(contactVerificationRequest.id, self.contactVerificationRequest.id);
      done(error);
    });
  });
  
  it('catches missing method value with validate static method', function(done) {
    var attributes = Object.clone(wh.attributes);
    delete attributes.method;

    ContactVerificationRequest.validate(attributes, function(errors, attributes) {
      if (!errors) {
        done(new Error('No errors returned by validate'));
      } else {
        assert.equal(errors[0].message, 'Required method value missing');
        done();
      }
    });
  });

  it('catches invalid method value with validate static method', function(done) {
    var attributes = Object.clone(wh.attributes);
    attributes.method = 'balderdash';

    ContactVerificationRequest.validate(attributes, function(errors, attributes) {
      if (!errors) {
        done(new Error('No errors returned by validate'));
      } else {
        assert.equal(errors[0].message, 'Invalid method value');
        done();
      }
    });
  });

  it('catches missing contact value with validate static method', function(done) {
    var attributes = Object.clone(wh.attributes);
    delete attributes.contact;

    ContactVerificationRequest.validate(attributes, function(errors, attributes) {
      if (!errors) {
        done(new Error('No errors returned by validate'));
      } else {
        assert.equal(errors[0].message, 'Required contact value missing');
        done();
      }
    });
  });

  it('catches invalid contact value with validate static method', function(done) {
    var attributes = Object.clone(wh.attributes);
    attributes.contact = 'example@example';

    ContactVerificationRequest.validate(attributes, function(errors, attributes) {
      if (!errors) {
        done(new Error('No errors returned by validate'));
      } else {
        assert.equal(errors[0].message, 'Invalid contact value');
        done();
      }
    });
  });

  it('catches invalid createUser value with validate static method', function(done) {
    var attributes = Object.clone(wh.attributes);
    attributes.createUser = 'apple';

    ContactVerificationRequest.validate(attributes, function(errors, attributes) {
      if (!errors) {
        done(new Error('No errors returned by validate'));
      } else {
        assert.equal(errors[0].message, 'Invalid createUser value');
        done();
      }
    });
  });

  it('catches invalid authenticateSession value with validate static method', function(done) {
    var attributes = Object.clone(wh.attributes);
    attributes.authenticateSession = 'apple';

    ContactVerificationRequest.validate(attributes, function(errors, attributes) {
      if (!errors) {
        done(new Error('No errors returned by validate'));
      } else {
        assert.equal(errors[0].message, 'Invalid authenticateSession value');
        done();
      }
    });
  });

  it('catches invalid createNotificationRequests value with validate static method', function(done) {
    var attributes = Object.clone(wh.attributes);
    attributes.createNotificationRequests = 'apple';

    ContactVerificationRequest.validate(attributes, function(errors, attributes) {
      if (!errors) {
        done(new Error('No errors returned by validate'));
      } else {
        assert.equal(errors[0].message, 'Invalid createNotificationRequests value');
        done();
      }
    });
  });

  it('catches invalid notificationRequest value with validate static method', function(done) {
    var attributes = Object.clone(wh.attributes);
    attributes.createNotificationRequests = ['apple'];

    ContactVerificationRequest.validate(attributes, function(errors, attributes) {
      if (!errors) {
        done(new Error('No errors returned by validate'));
      } else {
        assert.equal(errors[0].message, 'Invalid notificationRequest value');
        done();
      }
    });
  });

  it('catches missing clientOrigin value with validate static method', function(done) {
    var attributes = Object.clone(wh.attributes);
    delete attributes.clientOrigin;

    ContactVerificationRequest.validate(attributes, function(errors, attributes) {
      if (!errors) {
        done(new Error('No errors returned by validate'));
      } else {
        assert.equal(errors[0].message, 'Required clientOrigin value missing');
        done();
      }
    });
  });

  it('catches invalid clientOrigin value with validate static method', function(done) {
    var attributes = Object.clone(wh.attributes);
    attributes.clientOrigin = 3;

    ContactVerificationRequest.validate(attributes, function(errors, attributes) {
      if (!errors) {
        done(new Error('No errors returned by validate'));
      } else {
        assert.equal(errors[0].message, 'Invalid clientOrigin value');
        done();
      }
    });
  });

  it('filters out only unsupported values with validate static method', function(done) {
    var attributes = Object.clone(wh.attributes);
    attributes.foo = 'bar';

    ContactVerificationRequest.validate(attributes, function(errors, newAttributes) {
      assert.equal(newAttributes.method, attributes.method);
      assert.equal(newAttributes.contact, attributes.contact);
      assert.equal(newAttributes.code, attributes.code);
      assert.equal(newAttributes.createUser, attributes.createUser);
      assert.equal(newAttributes.authenticateSession, attributes.authenticateSession);
      assert.equal(newAttributes.createNotificationRequests[0].event, attributes.createNotificationRequests[0].event);
      assert.equal(newAttributes.clientOrigin, attributes.clientOrigin);
      assert.equal(typeof newAttributes.foo, 'undefined');
      done();
    });
  });
});