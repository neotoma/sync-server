module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    nodemon: {
      dev: {
        script: 'server.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-nodemon');

  // Run local web server for development
  grunt.registerTask('dev', [
    'nodemon'
  ]);
};