module.exports = {
  toObject: function(sources) {
    return [
      {
        id: 'checkin',
        name: 'Checkin',
        sources: this.sourceIds(sources, 'checkin')
      },
      {
        id: 'tip',
        name: 'Tip',
        sources: this.sourceIds(sources, 'tip')
      },
      {
        id: 'friend',
        name: 'Friend',
        sources: this.sourceIds(sources, 'friend')
      }
    ];
  },

  sourceIds: function(sources, checkinId) {
    return sources.map(function(source) {
      if (source.contentTypes.indexOf(checkinId) > -1) {
        return source.id;
      }
    })
  }
};