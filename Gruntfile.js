/**
 * Configure Grunt scripts
 * @module
 */

require('dotenvs')();
var fs = require('fs');
var loadGruntTasks = require('load-grunt-tasks');
var path = require('path');

module.exports = function(grunt) {
  'use strict';

  /**
   * Deploy file or directory if exists to host directory
   * @param {string} src - Path for source of file or directory relative to local repository directory
   * @param {string} [dest] - Path for destination of file or directory relative to deployment host directory. Defaults to same value as src.
   * @param {string} [args] – rsync arguments
   */
  grunt.registerTask('deploy', 'Deploy file or directory (if it exists) to host directory', function(src, dest, args) {
    if (!grunt.file.exists(`${__dirname}/${src}`)) { return console.log('File or directory does not exist'); }

    // Ensure deployment host directory exists and prepend custom arguments
    args = args ? args : '';
    args = `${args} --rsync-path="mkdir -p ${process.env.SYNC_SERVER_DEPLOY_HOST_DIR} && rsync"`;

    // Use same path for destination as source if not declared
    dest = dest ? dest : src;

    var isDir = fs.lstatSync(src).isDirectory();
    var dest = dest ? path.resolve(process.env.SYNC_SERVER_DEPLOY_HOST_DIR, dest) : path.resolve(process.env.SYNC_SERVER_DEPLOY_HOST_DIR, src);

    if (isDir) {
      src = src + '/';
      dest = dest + '/';
    }

    grunt.config.set('rsync.options.args', [args]);
    grunt.config.set('rsync.options.src', src);
    grunt.config.set('rsync.options.dest', dest);
    grunt.task.run('rsync:deploy');
  });

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
          src: ['app', 'fixtures'],
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
    'mochaTest:tests',
    'deploy-dependencies',
    'deploy-app'
  ]);

  grunt.registerTask('deploy-certs', 'Deploy certificates to host directory', [
    `deploy:${process.env.SYNC_SERVER_DEPLOY_CERTS_DIR}:.certs`
  ]);

  grunt.registerTask('deploy-env', 'Deploy environment configuration to host directory', [
    `deploy:.env-deploy:.env`
  ]);

  grunt.registerTask('deploy-dependencies', 'Deploy environment config files and certificate files', [
    'deploy-certs',
    'deploy-env'
  ]);

  grunt.registerTask('deploy-app', 'Deploy app to host directory', [
    `deploy:Gruntfile.js`,
    `deploy:package.json`,
    `deploy:app`,
    'force:sshexec:npmInstall'
  ]);

  grunt.registerTask('restart-forever', 'Start/restart app remotely with forever', [
    'sshexec:foreverRestart'
  ]);

  grunt.registerTask('restart-systemd', 'Start/restart app remotely with systemd', [
    'sshexec:systemdRestart'
  ]);
};