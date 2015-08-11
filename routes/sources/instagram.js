module.exports = function(app, properties) {
  var SourceRouter = require('./router');
  var logger = require('../../lib/logger');

  return new SourceRouter(app, {
    source_id: 'instagram'
  });
};