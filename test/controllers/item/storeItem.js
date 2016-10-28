var db = require('../../db');
var wh = require('../../warehouse');
var controller = require('../../../controllers/item');
var nock = require('../../../lib/nock');
var app = require('../../../app');
var itThrowsError = require('../../method/itThrowsError');

describe('item controller', function() {
  beforeEach(db.clear);

  describe('storeItem method', function() {
    /*itThrowsError(controller.storeItem, [{
      when: 'no app parameter provided',
      params: [app, user, storage, source, contentType, item, done],
      msg: 'Parameter app undefined or null',

      'no app parameter provided'
      'app parameter has no emit method'
      'no user parameter provided'
      'user parameter has no id property'
      'no storage parameter provided'
      'storage parameter has no id property'
      'no contentType parameter provided'
      'contentType parameter has no id property'
      'contentType parameter has no pluralId method'
      'no item parameter provided'
      'item parameter not valid object'
      'no done parameter provided'
      'done parameter not a function'
    }]);*/

    it('returns 200 status if provided valid parameters');
  });
});