const schemaService = require('../src/schema_service');

describe('schema_service getSchema', () => {
  it('should call req.json passing the schema', async () => {
    const json = jest.fn();
    const res = { json };
    await schemaService.getSchema({}, res);
    expect(json).toHaveBeenCalled();
  });
});