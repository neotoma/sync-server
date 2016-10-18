var ContentType = require('../models/contentType');

module.exports = {
  supportedIds: [
    'checkin',
    'friend',
    'image',
    'tip',
    'video'
  ],

  toObject: function(sources) {
    var contentTypeObjects = [];
    this.supportedIds.forEach(function(contentTypeId) {
      contentTypeObjects.push(new ContentType(contentTypeId).toObject(sources));
    });

    return contentTypeObjects;
  }
};