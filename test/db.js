process.env.NODE_ENV = 'test';
var mongoose = require('../lib/mongoose');
var warehouse = require('./warehouse');

var clear = function() {
  for (var i in mongoose.connection.collections) {
    mongoose.connection.collections[i].remove(function() {});
  }
};

before(function() {
  clear();
});

after(function(done) {
  clear();
  mongoose.disconnect();
  done();
});

module.exports = {
  clear: clear
};