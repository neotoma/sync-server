/**
 * Configure Grunt scripts
 * @module
 */

require('./lib/env')();
var loadGruntTasks = require('load-grunt-tasks');

module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    clean: {
      jsdoc: 'docs'
    },
    jsdoc: {
      build: {
        options: {
          configure : '.jsdoc.json'
        }
      }
    },
    mochaTest: {
      tests: {
        src: ['tests/**/*.js']
      }
    },
    nodemon: {
      dev: {
        script: 'server.js'
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
        command: 'cd ' + process.env.SYNC_SERVER_DEPLOY_HOST_DIR + ' && forever restart server.js || forever start server.js'
      },
      systemd: {
        command: 'sudo systemctl restart syncserver || sudo systemctl start syncserver'
      }
    },
    watch: {
      jsdoc: {
        files: ['.env*', '.jsdoc.json', 'README.md', '**/*.js', '!**/node_modules/**', '!**/docs/**'],
        tasks: ['jsdoc']
      }
    }
  });

  loadGruntTasks(grunt);

  grunt.registerTask('jsdoc:rebuild', 'Delete and regenerate docs', [
    'clean:jsdoc',
    'jsdoc:build'
  ]);

  grunt.registerTask('jsdoc-dev', 'Regenerate docs upon changes', [
    'jsdoc:rebuild',
    'watch:jsdoc'
  ]);

  grunt.registerTask('dev', 'Run app locally and reload upon changes', [
    'jsdoc:rebuild',
    'nodemon:dev'
  ]);

  grunt.registerTask('deploy', 'Run tests and deploy', [
    'jsdoc:rebuild',
    'mochaTest:tests',
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

  grunt.registerTask('forever', 'Start/restart app remotely with forever', [
    'sshexec:forever'
  ]);

  grunt.registerTask('systemd', 'Start/restart app remotely with systemd', [
    'sshexec:systemd'
  ]);
};