/**
 * grunt-deploy
 * @module
 */

'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function(grunt) {
  /**
   * Deploy file or directory (if it exists) to host directory
   * @param {string}srcRel - Path for source of file or directory relative to local repository directory
   * @param {string} [destRel] - Path for destination of file or directory relative to deployment host directory. Defaults to same value as src.
   * @param {string} [args] – rsync arguments
   */
  grunt.registerTask('deploy', 'Deploy file or directory (if it exists) to host directory', function(srcRel, destRel, args) {
    var srcAbs = path.resolve(process.env.SYNC_SERVER_DIR, srcRel);

    if (!grunt.file.exists(srcAbs)) { return grunt.log.writeln('File or directory does not exist: %s', srcAbs); }

    // Ensure deployment host directory exists and prepend custom arguments
    args = args ? args : '';
    args = `${args} --rsync-path="mkdir -p ${process.env.SYNC_SERVER_DEPLOY_HOST_DIR} && rsync"`;

    // Use same path for destination as source if not declared
    destRel = destRel ? destRel : srcRel;

    // Resolve relative path to dest to absolute
    var destAbs = path.resolve(process.env.SYNC_SERVER_DEPLOY_HOST_DIR, destRel);

    if (fs.lstatSync(srcAbs).isDirectory()) {
      srcAbs = srcAbs + '/';
      destAbs = destAbs + '/';
    }

    grunt.config.set('rsync.options.args', [args]);
    grunt.config.set('rsync.options.src', srcAbs);
    grunt.config.set('rsync.options.dest', destAbs);
    grunt.task.run('rsync:deploy');
  });
};