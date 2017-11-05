/**
 * Configure Grunt scripts
 * @module
 */

require('park-ranger')();
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
        script: 'index.js'
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

  grunt.registerTask('rebuild-jsdoc', 'Delete and regenerate JSDoc documentation.', [
    'clean:jsdoc',
    'jsdoc:build'
  ]);

  grunt.registerTask('test', 'Run tests against app.', [
    'env:test',
    'eslint',
    'mochaTest:tests'
  ]);
};