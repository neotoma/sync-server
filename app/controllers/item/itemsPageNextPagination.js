var debug = require('app/lib/debug')('app:itemController'),
  validateParams = require('app/lib/validateParams');

/**
 * Returns pagination for next items page after current items page.
 * @param {Object} page - Current items page.
 * @param {Object} pagination - Pagination of current items page.
 * @param {Object} contentType - ContentType of current items page.
 * @returns {Object} Pagination for next items page.
 */
module.exports = function(page, pagination, contentType) {
  validateParams([{
    name: 'page', variable: page, required: true, requiredType: 'object'
  }, {
    name: 'contentType', variable: contentType, requiredProperties: ['pluralCamelName']
  }]);

  var nextPagination;
  
  debug.start('itemsPageNextPagination (pagination: %o)', pagination);
  
  if (page.response && page.response[contentType.pluralLowercaseName()] && page.response[contentType.pluralLowercaseName()].items && page.response[contentType.pluralLowercaseName()].items.length) {
    if (pagination && pagination.offset) {
      nextPagination = { offset: pagination.offset + page.response[contentType.pluralLowercaseName()].items.length };
    } else {
      nextPagination = { offset: page.response[contentType.pluralLowercaseName()].items.length };
    }
  }

  if (page.data && page.data.pagination && page.data.pagination.next_max_id) {
    nextPagination = { maxId: page.data.pagination.next_max_id };
  }

  if (page.links && page.links.next) {
    nextPagination = { next: page.links.next };
  }

  if (page.paging && page.paging.next) {
    nextPagination = { next: page.paging.next };
  }

  debug.success('itemsPageNextPagination (nextPagination: %o)', nextPagination);

  return nextPagination;
};
