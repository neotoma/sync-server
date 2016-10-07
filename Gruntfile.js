module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    nodemon: {
      dev: {
        script: 'app-server.js',
        options: {
          env: {
            NODE_ENV: 'development'
          }
        }
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
          dest: process.env.SYNC_DEPLOY_HOST_DIR,
          host: process.env.SYNC_DEPLOY_HOST_USERNAME + '@' + process.env.SYNC_DEPLOY_HOST
        }
      }
    },
    sshexec: {
      options: {
        host: process.env.SYNC_DEPLOY_HOST,
        port: 22,
        username: process.env.SYNC_DEPLOY_HOST_USERNAME,
        agent: process.env.SSH_AUTH_SOCK
      },
      npmInstall: {
        command: 'cd ' + process.env.SYNC_DEPLOY_HOST_DIR + ' && npm install --production'
      },
      foreverRestartAll: {
        command: 'cd ' + process.env.SYNC_DEPLOY_HOST_DIR + ' && forever restart app-server.js'
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  // Run local web server for development
  grunt.registerTask('dev', [
    'nodemon:dev'
  ]);

  // Deploy to host
  grunt.registerTask('deploy', [
    'rsync',
    'sshexec:npmInstall',
    'sshexec:foreverRestartAll'
  ]);
};