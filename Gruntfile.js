require('dotenv').config();

module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    nodemon: {
      dev: {
        script: 'app-server.js'
      }
    },
    mochaTest: {
      main: {
        src: ['test/**/*.js']
      }
    },
    rsync: {
      options: {
        host: process.env.SYNC_SERVER_DEPLOY_HOST_USERNAME + '@' + process.env.SYNC_SERVER_DEPLOY_HOST,
        recursive: true
      },
      app: {
        options: {
          args: ['--rsync-path="mkdir -p ' + process.env.SYNC_SERVER_DEPLOY_HOST_DIR + ' && rsync"'],
          exclude: [
            '.DS_Store',
            '.git',
            'node_modules',
            '*.sublime*',
            '.certs*',
            '.env*'
          ],
          src: './',
          dest: process.env.SYNC_SERVER_DEPLOY_HOST_DIR
        }
      },
      certs: {
        options: {
          src: process.env.SYNC_SERVER_DEPLOY_CERTS_DIR + '/',
          dest: process.env.SYNC_SERVER_DEPLOY_HOST_DIR + '/.certs/'
        }
      },
      env: {
        options: {
          src: '.env-deploy',
          dest: process.env.SYNC_SERVER_DEPLOY_HOST_DIR + '/.env'
        }
      }
    },
    sshexec: {
      options: {
        agent: process.env.SSH_AUTH_SOCK,
        host: process.env.SYNC_SERVER_DEPLOY_HOST,
        username: process.env.SYNC_SERVER_DEPLOY_HOST_USERNAME,
        port: 22
      },
      npmInstall: {
        command: 'cd ' + process.env.SYNC_SERVER_DEPLOY_HOST_DIR + ' && npm install --production'
      },
      foreverRestartAll: {
        command: 'cd ' + process.env.SYNC_SERVER_DEPLOY_HOST_DIR + ' && forever restart app-server.js || forever start app-server.js'
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  // Run local web server for development
  grunt.registerTask('dev', [
    'nodemon:dev'
  ]);

  // Run tests and deploy
  grunt.registerTask('deploy', [
    'mochaTest:main',
    'deploy-post-tests'
  ]);

  // Deploy to host after running tests
  grunt.registerTask('deploy-post-tests', [
    'rsync:app',
    'rsync:certs',
    'rsync:env',
    'force:sshexec:npmInstall',
    'sshexec:foreverRestartAll'
  ]);
};