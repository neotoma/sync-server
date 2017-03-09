/**
 * Configure Grunt scripts
 * @module
 */

require('dotenvs')();
var loadGruntTasks = require('load-grunt-tasks');

module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    clean: {
      jsdoc: 'docs'
    },
    eslint: {
      options: {
        configFile: '.eslintrc.js',
        fix: true
      },
      dev: [
        '**/*.js',
        '!docs/**/*.js',
        '!node_modules/**/*.js'
      ]
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
        script: 'app/server.js'
      }
    },
    rsync: {
      deploy: {
        options: {
          host: process.env.SYNC_SERVER_DEPLOY_HOST_USERNAME + '@' + process.env.SYNC_SERVER_DEPLOY_HOST,
          recursive: true
        }
      }
    },
    symlink: {
      modules: {
        files: [{
          expand: true,
          cwd: './',
          src: ['app', 'fixtures', 'data'],
          dest: 'node_modules'
        }]
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
        command: 'cd ' + process.env.SYNC_SERVER_DEPLOY_HOST_DIR + ' && npm install'
      },
      foreverRestart: {
        command: 'cd ' + process.env.SYNC_SERVER_DEPLOY_HOST_DIR + ' && forever restart server.js || forever start server.js'
      },
      systemdRestart: {
        command: 'sudo systemctl restart syncserver || sudo systemctl start syncserver'
      },
      repopulateCollections: {
        command: 'cd ' + process.env.SYNC_SERVER_DEPLOY_HOST_DIR + ' && grunt repopulate-collections'
      }
    },
    watch: {
      jsdoc: {
        files: [
          '.env*',
          '.jsdoc.json',
          '**/*.js',
          'README.md',
          '!**/node_modules/**',
          '!**/docs/**'
        ],
        tasks: ['jsdoc']
      }
    }
  });

  loadGruntTasks(grunt);
  grunt.task.loadTasks('app/lib/tasks');

  grunt.registerTask('jsdoc-rebuild', 'Delete and regenerate docs', [
    'clean:jsdoc',
    'jsdoc:build'
  ]);

  grunt.registerTask('jsdoc-dev', 'Regenerate docs upon changes', [
    'jsdoc-rebuild',
    'watch:jsdoc'
  ]);

  grunt.registerTask('dev', 'Run app locally and reload upon changes', [
    'jsdoc-rebuild',
    'nodemon:dev'
  ]);

  grunt.registerTask('deploy-all', 'Run tests and deploy all files', [
    'test',
    'deploy-dependencies',
    'deploy-app',
    'deploy-data'
  ]);

  grunt.registerTask('deploy-certs', 'Deploy certificates to host directory', [
    `deploy:${process.env.SYNC_SERVER_DEPLOY_CERTS_DIR}:.certs`
  ]);

  grunt.registerTask('deploy-env', 'Deploy environment configuration to host directory', [
    'deploy:.env-deploy:.env'
  ]);

  grunt.registerTask('deploy-data', 'Deploy data to host directory', [
    'deploy:data-deploy:data'
  ]);

  grunt.registerTask('deploy-dependencies', 'Deploy environment config files and certificate files', [
    'deploy-certs',
    'deploy-env'
  ]);

  grunt.registerTask('deploy-app', 'Deploy app to host directory', [
    'deploy:Gruntfile.js',
    'deploy:package.json',
    'deploy:app:app:--delete',
    'force:sshexec:npmInstall'
  ]);

  grunt.registerTask('restart-forever', 'Start/restart app remotely with forever', [
    'sshexec:foreverRestart'
  ]);

  grunt.registerTask('restart-systemd', 'Start/restart app remotely with systemd', [
    'sshexec:systemdRestart'
  ]);

  grunt.registerTask('remote-repopulate-collections', 'Remove database collections and repopulate them with resourceObjects stored in files', [
    'sshexec:repopulateCollections'
  ]);

  grunt.registerTask('test', 'Test code', [
    'eslint',
    'mochaTest:tests'
  ]);
};