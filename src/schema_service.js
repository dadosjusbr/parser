const fs = require('fs');
const { promisify } = require('util');

const SCHEMA_PATH = __dirname + '/resources/schema.json';

/**
 * Load and parse schema from file system.
 */
const _loadSchema = async () => {
  const bufferedSchema = await promisify(fs.readFile)(SCHEMA_PATH);
  return JSON.parse(bufferedSchema);
};

/**
 * Responds the request with the json schema. 
 */
const getSchema = async (req, res) => {
  const schema = await exportedFunctions._loadSchema();
  res.json(schema);
};

const exportedFunctions = { getSchema, _loadSchema }; 

module.exports = exportedFunctions;