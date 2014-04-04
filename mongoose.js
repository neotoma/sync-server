var mongoose = require('mongoose');

mongoose.connection.on('error', function(error) {
  console.error('mongoose connection error: %s', error);
});

mongoose.connection.once('open', function() {
  console.log('mongoose connection opened');
});

mongoose.connect(require('./config/database.js').url);

module.exports = mongoose;