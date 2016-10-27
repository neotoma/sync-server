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
    }]);*/

    it('returns 200 status if provided valid parameters');
  });
});