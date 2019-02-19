const schemaService = require('../src/schema_service');

describe('schema_service _loadSchema', () => {
  it('should return a promise containing the parsed content of the schema file', async () => {
    const schema = await schemaService._loadSchema();
    
    expect(!!schema).toBe(true);
    expect(!!schema.version).toBe(true); 
    expect(!!schema.fields).toBe(true); 
  });
});

describe('schema_service getSchema', () => {
  it('should call req.json passing the schema', async () => {
    const json = jest.fn();
    const res = { json };
    await schemaService.getSchema({}, res);
    expect(json).toHaveBeenCalled();
  });
});