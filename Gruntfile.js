module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    express: {
      options: {
        hostname: 'localhost',
        port: 9090,
        server: 'server.js'
      },
      main: {
        bases: 'public'
      }
    }
  });

  grunt.loadNpmTasks('grunt-express');

  // Run local web server for development
  grunt.registerTask('dev', [
    'express',
    'express-keepalive'
  ]);
};