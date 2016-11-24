module.exports = require('./warehouse')('contactVerificationRequest', {
  method: 'email',
  contact: 'example@example.com',
  code: '123456789',
  createUser: true,
  authenticateSession: true,
  createNotificationRequests: [{
    event: 'Test'
  }],
  clientOrigin: 'http://example.com',
  verified: false
});