var pluralize = require('pluralize'); 

module.exports = function ContentType(id) {
  this.id = id;
  this.plural_id = pluralize(id);
}