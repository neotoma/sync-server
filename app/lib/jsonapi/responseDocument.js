module.exports = function(data, included, errors) {
  var doc = {};

  if (data) {
    doc['data'] = data;

    if (included && (!Array.isArray(included) || included.length > 0)) {
      doc['included'] = included;
    }
  } else if (errors) {
    doc['errors'] = errors;
  }

  doc['jsonapi'] = {
    version: '1.0'
  };

  return doc;
};
