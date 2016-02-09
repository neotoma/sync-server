var pluralize = require('pluralize');
var prototype = require('../lib/prototypes/array');
var prototype = require('../lib/prototypes/string');

module.exports = function ContentType(id) {
  this.id = id;
  this.plural_id = pluralize(id);
  this.name = id.capitalizeFirstLetter();
  this.plural_name = this.plural_id.capitalizeFirstLetter();

  this.toObject = function(sources) {
    var sourceIds;
    var self = this;

    if (typeof sources !== 'undefined' && sources.length > 0) {
      sourceIds = sources.map(function(source) {
        var sourceObject = source.toObject();
        if (sourceObject.contentTypes && sourceObject.contentTypes.indexOf(self.id) > -1) {
          return sourceObject.id;
        }
      }).clean();
    }

    return {
      id: this.id,
      pluralId: this.plural_id,
      name: this.name,
      pluralName: this.plural_name,
      sourceIds: sourceIds
    };
  };
}