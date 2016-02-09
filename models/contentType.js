var pluralize = require('pluralize'); 

module.exports = function ContentType(id) {
  this.id = id;
  this.plural_id = pluralize(id);
  this.name = id.capitalizeFirstLetter();
  this.plural_name = this.plural_id.capitalizeFirstLetter();

  this.toObject = function(sources) {
    var sourceIds;
    var self = this;

    if (typeof sources === 'array' && sources.length > 0) {
      sourceIds = [];
      sources.forEach(function(source) {
        if (source.contentTypes && source.contentTypes.indexOf(self.id) > -1) {
          sourceIds.push(source.id);
        }
      });
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