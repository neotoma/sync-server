/**
 * Models suite
 * @module
 */

var fs = require('fs');
var path = require('path');

var files = fs.readdirSync(__dirname);
var models = {};

files.splice(files.indexOf('index.js'), 1);

files.forEach((filename) => {
  if (filename.indexOf('.js') === -1) { return; }

  var model = require(path.join(__dirname, filename));
  models[model.modelId()] = model;
});

module.exports = models;