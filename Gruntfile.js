module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    nodemon: {
      dev: {
        script: 'app.js'
      }
    },
    rsync: {
      main: {
        options: {
          exclude: [
            ".DS_Store",
            ".git",
            "node_modules",
            "*.sublime*"
          ],
          recursive: true,
          src: './',
          dest: process.env.ASHEVILLE_SYNC_DEPLOY_HOST_DIR,
          host: process.env.ASHEVILLE_SYNC_DEPLOY_HOST_USERNAME + '@' + process.env.ASHEVILLE_SYNC_DEPLOY_HOST
        }
      }
    },
    sshexec: {
      options: {
        host: process.env.ASHEVILLE_SYNC_DEPLOY_HOST,
        port: 22,
        username: process.env.ASHEVILLE_SYNC_DEPLOY_HOST_USERNAME,
        agent: process.env.SSH_AUTH_SOCK
      },
      foo: {
        command: 'which nvm'
      },
      npmInstall: {
        command: 'cd ' + process.env.ASHEVILLE_SYNC_DEPLOY_HOST_DIR + ' && npm install --production'
      },
      foreverRestartAll: {
        command: 'cd ' + process.env.ASHEVILLE_SYNC_DEPLOY_HOST_DIR + ' && forever restartall'
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  // Run local web server for development
  grunt.registerTask('dev', [
    'nodemon'
  ]);

  // Run local web server for pre-deployment testing
  grunt.registerTask('deploy-test', [
    'deploy-dry',
    'env:deploy',
    'express',
    'express-keepalive'
  ]);

  // Deploy to host
  grunt.registerTask('deploy', [
    'rsync',
    'sshexec:npmInstall',
    'sshexec:foreverRestartAll'
  ]);
};