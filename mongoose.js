module.exports = function(app) {
  var mongoose = require('mongoose');

  mongoose.connection.on('error', function(error) {
    console.error('mongoose failed to connect: %s', error);
  });

  mongoose.connection.once('open', function() {
    console.log('mongoose connected');
  });

  mongoose.connect(app.config.mongodbURL);

  return mongoose;
}