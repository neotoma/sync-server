var ContentType = require('../models/content_type');

module.exports = {
  toObject: function(sources) {
    var contentTypeIds = [
      'checkin',
      'friend',
      'image',
      'tip',
      'video'
    ];

    var contentTypeObjects = [];
    contentTypeIds.forEach(function(contentTypeId) {
      contentTypeObjects.push(new ContentType(contentTypeId).toObject(sources));
    });

    return contentTypeObjects;
  }
};