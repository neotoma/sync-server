process.env.NODE_ENV = 'test';
var mongoose = require('../lib/mongoose');

var clear = function() {
  for (var i in mongoose.connection.collections) {
    mongoose.connection.collections[i].remove(function() {});
  }
};

before(clear);

after(function() {
  clear();
  mongoose.disconnect();
});

module.exports = {
  clear: clear
};