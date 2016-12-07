process.env.SYNC_SERVER_ENV = 'test';
require('dotenv').config({ path: __dirname + '/../.env' });

var mongoose = require('../lib/mongoose');

var clear = function(done) {
  for (var i in mongoose.connection.collections) {
    mongoose.connection.collections[i].remove(function() {});
  }
  done();
};

before(clear);

after(function(done) {
  clear(function() {
    mongoose.disconnect();
    done();
  });
});

module.exports = {
  clear: clear
};