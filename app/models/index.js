/**
 * Models suite
 * @module
 */

var fs = require('fs'),
  path = require('path');

var files = fs.readdirSync(__dirname),
  models = {};

files.splice(files.indexOf('index.js'), 1);

files.forEach((filename) => {
  if (filename.indexOf('.js') === -1) { return; }

  // eslint-disable-next-line global-require
  var model = require(path.join(__dirname, filename));

  models[model.modelId()] = model;
});

module.exports = models;
