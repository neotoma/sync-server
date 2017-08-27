/**
 * Customized debug module
 * @module
 */

var colors = require('colors/safe');
var Debug = require('debug');

module.exports = function(name) {
  // Ensure env variable is loaded even if debug module was previously loaded with other value
  Debug.enable(process.env.DEBUG);

  var debug = Debug(name);

  debug.style = function(styles, args) {
    if (args[0].indexOf('## ') !== -1) {
      styles.push('italic');
      args[0] = ' ' + args[0].replace('## ', '');
    } else if (args[0].indexOf('# ') !== -1) {
      styles.push('bold');
      args[0] = args[0].replace('# ', '');
    } else {
      args[0] = '  ' + args[0];
    }

    styles.forEach((style) => {
      args[0] = colors.stylize(args[0], style);
    });

    this.apply(this, args);
  };

  debug.start = function() {
    arguments[0] = 'START: ' + arguments[0];
    this.style(['magenta'], arguments);
  };

  debug.success = function() {
    arguments[0] = 'SUCCESS: ' + arguments[0];
    this.style(['green'], arguments);
  };

  debug.error = function() {
    arguments[0] = 'ERROR: ' + arguments[0];
    this.style(['red'], arguments);
  };

  debug.warning = function() {
    arguments[0] = 'WARNING: ' + arguments[0];
    this.style(['yellow'], arguments);
  };

  debug.trace = function() {
    this.style(['gray'], arguments);
  };

  debug.noAsyncTrace= function(depth=1,compact=false,filter='async.js'){
    this.stackTrace(depth,compact,filter);
  };

  debug.stackTrace = function(depth = 1,compact=false, filter=null) {
    depth = depth < 1 ? 1 : depth;
    let theCurrentStack = sTrace.get();
    let tmp,fileName,output;

    output = 'trace: ';
    depth = depth < theCurrentStack.length -1 ? depth : theCurrentStack.length -1;

    for (let i = 1; i <= depth; i++) {
      tmp = theCurrentStack[i];
      fileName = tmp.getFileName();


      if (fileName.indexOf('/') > -1) {
        fileName = fileName.split('/').pop();

        if (filter && filter.indexOf(fileName) > -1) continue;
      }

      if (compact) {
        output += `${fileName}.${tmp.getFunctionName()}, --> `;
      } else {
        output += `${tmp.getFunctionName()}, ${fileName}, ${tmp.getLineNumber()}\n`;
      }
    }

    this(output);
  };

  return debug;
};