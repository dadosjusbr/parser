const schema = require('./schema');

/**
 * Responds the request with the json schema. 
 */
const getSchema = async (req, res) => {
  res.json(schema);
};
 
module.exports = { getSchema };