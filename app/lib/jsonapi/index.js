/**
 * Generates routes conformant to the JSON API specification for Mongoose models
 * @module
 */

var jsonapi = {
  adminFlag: (process.env.SYNC_SERVER_PUBLIC_ADMIN == 'true') ? 'public' : 'admin'
};

[
  'addRelationshipToResourceObject',
  'allowed',
  'compiledQueryConditions',
  'modelQueryConditions',
  'normalizeRelationships',
  'resourceObjectFromDocument',
  'resourceIdentifierObjectFromDocument',
  'responseDocument',
  'routeModelDeleteObjectResource',
  'routeModelGetObjectResource',
  'routeModelGetObjectsResource',
  'routeModelResources',
  'routeModelPatchObjectResource',
  'routeModelPostObjectResource',
  'routeModelResource',
  'routeResource',
  'saveRelationshipsToDocument',
  'sendData',
  'sendResponseDocument',
  'sendDocument',
  'sendDocuments',
  'sendError',
  'sendNotFound',
  'validateQueryData',
  'validateRequestBody'
].forEach((module) => {
  // eslint-disable-next-line global-require
  jsonapi[module] = require(`./${module}`);
});

module.exports = jsonapi;
