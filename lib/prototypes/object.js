/*
 * Return value nested within object by string path
 * Copied from {@link http://stackoverflow.com/a/6491621/1816956|Stack Overflow}
 * @param {Object} o - Object
 * @param {string} s - String path (e.g. people[2].name)
*/
Object.byString = function(o, s) {
  s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  s = s.replace(/^\./, ''); // strip a leading dot
  var a = s.split('.');

  for (var i = 0, n = a.length; i < n; ++i) {
    var k = a[i];
    if (k in o) {
      o = o[k];
    } else {
      return;
    }
  }
  
  return o;
}