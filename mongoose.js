var mongoose = require('mongoose');

mongoose.connection.on('error', function(error) {
  console.error('mongoose failed to connect: %s', error);
});

mongoose.connection.once('open', function() {
  console.log('mongoose connected');
});

mongoose.connect(require('./config/database.js').url);

module.exports = mongoose;