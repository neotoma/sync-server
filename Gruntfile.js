require('./lib/env');

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
        args: ['--rsync-path="mkdir -p ' + process.env.SYNC_SERVER_DEPLOY_HOST_DIR + ' && rsync"'],
        host: process.env.SYNC_SERVER_DEPLOY_HOST_USERNAME + '@' + process.env.SYNC_SERVER_DEPLOY_HOST,
        recursive: true
      },
      app: {
        options: {
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
      forever: {
        command: 'cd ' + process.env.SYNC_SERVER_DEPLOY_HOST_DIR + ' && forever restart app-server.js || forever start app-server.js'
      },
      systemd: {
        command: 'systemctl restart syncserver || systemctl start syncserver'
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('dev', 'Run local web server for development', [
    'nodemon:dev'
  ]);

  grunt.registerTask('deploy', 'Run tests and deploy', [
    'mochaTest:main',
    'deploy-dependencies',
    'deploy-app'
  ]);

  grunt.registerTask('deploy-dependencies', 'Deploy environment config files and certificate files', [
    'rsync:certs',
    'rsync:env'
  ]);
 
  grunt.registerTask('deploy-app', 'Deploy app and install modules', [
    'rsync:app',
    'force:sshexec:npmInstall'
  ]);

  grunt.registerTask('deploy-forever', 'Deploy app, install modules and start/restart with forever', [
    'deploy',
    'sshexec:forever'
  ]);

  grunt.registerTask('deploy-systemd', 'Deploy app, install modules and start/restart with systemd', [
    'deploy',
    'sshexec:systemd'
  ]);
};