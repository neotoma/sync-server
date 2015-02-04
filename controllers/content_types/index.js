module.exports = {
  toObject: function(sources) {
    return [
      {
        id: 'checkin',
        name: 'Checkin',
        pluralName: 'Checkins',
        sources: this.sourceIds(sources, 'checkin')
      },
      {
        id: 'friend',
        name: 'Friend',
        pluralName: 'Friends',
        sources: this.sourceIds(sources, 'friend')
      },
      {
        id: 'tip',
        name: 'Tip',
        pluralName: 'Tips',
        sources: this.sourceIds(sources, 'tip')
      }
    ];
  },

  sourceIds: function(sources, contentTypeId) {
    var sourceIds = [];

    sources.forEach(function(source) {
      if (source.contentTypes && source.contentTypes.indexOf(contentTypeId) > -1) {
        sourceIds.push(source.id);
      }
    });

    return sourceIds;
  }
};