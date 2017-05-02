/**
 * Configure Grunt scripts
 * @module
 */

var ranger = require('park-ranger')(true);
var loadGruntTasks = require('load-grunt-tasks');

module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    clean: {
      jsdoc: 'docs'
    },
    'deploy-files': {
      options: {
        destDir: ranger.env.SYNC_SERVER_DEPLOY_HOST_DIR,
        destHost: ranger.env.SYNC_SERVER_DEPLOY_HOST,
        destUser: ranger.env.SYNC_SERVER_DEPLOY_HOST_USER,
        srcDir: __dirname
      },
      app: {
        args: '--delete',
        src: 'app',
        systemdService: ranger.env.SYNC_SERVER_DEPLOY_SYSTEMD_SERVICE
      },
      certs: {
        src: ranger.env.SYNC_SERVER_DEPLOY_CERTS_DIR,
        dest: '.certs'
      },
      data: {
        src: 'data-deploy',
        dest: 'data'
      },
      env: {
        src: '.env-deploy',
        dest: '.env'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      package: {
        src: 'package.json'
      }
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
    env: {
      test: {
        ENV_NAME: 'test'
      }
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
        agent: ranger.env.SSH_AUTH_SOCK,
        host: ranger.env.SYNC_SERVER_DEPLOY_HOST,
        username: ranger.env.SYNC_SERVER_DEPLOY_HOST_USER,
        port: 22
      },
      repopulateCollections: {
        command: 'cd ' + ranger.env.SYNC_SERVER_DEPLOY_HOST_DIR + ' && grunt repopulate-collections'
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

  grunt.registerTask('dev', 'Run app locally and reload upon changes.', [
    'nodemon:dev'
  ]);

  grunt.registerTask('dev-jsdoc', 'Regenerate JSDoc documentation upon changes.', [
    'rebuild-jsdoc',
    'watch:jsdoc'
  ]);

  grunt.registerTask('deploy', 'Deploy all dependencies, app files and data to host directory.', [
    'deploy-dependencies',
    'deploy-app',
    'deploy-files:data'
  ]);

  grunt.registerTask('deploy-dependencies', 'Deploy environment config and certificate files to host directory.', [
    'deploy-files:certs',
    'deploy-files:env'
  ]);

  grunt.registerTask('deploy-app', 'Deploy app files to host directory.', [
    'deploy-files:gruntfile',
    'deploy-files:package',
    'deploy-files:app'
  ]);

  grunt.registerTask('rebuild-jsdoc', 'Delete and regenerate JSDoc documentation.', [
    'clean:jsdoc',
    'jsdoc:build'
  ]);

  grunt.registerTask('remote-repopulate-collections', 'Remove database collections and repopulate them with resourceObjects stored in files.', [
    'sshexec:repopulateCollections'
  ]);

  grunt.registerTask('test', 'Run tests against app.', [
    'env:test',
    'eslint',
    'mochaTest:tests'
  ]);
};