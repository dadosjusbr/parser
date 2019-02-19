const supertest = require('supertest');
const nock = require('nock');
const app = require('../src/server');

const schemaService = require('../src/schema_service.js');

const server = app.listen();
const request = supertest.agent(server)

afterAll(function(done){
  server.close(done)
});

describe('GET /', () => {
  const url = 'http://www.test.com';

  beforeAll(() => nock(url).get('/').reply(200, ''));

  it('Should respond success status code and the correct message', async () => {
    const response = await request.get(`/?spreadsheetUrl=${url}`);
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('this will be a csv file');
  });


  it('Should respond bad request status code when no url is passed in query params', async () => {
    const response = await request.get('/');
    expect(response.statusCode).toBe(400);
    const responseObj = JSON.parse(response.text);
    expect(responseObj.message).toEqual('Invalid spreadsheet url!');
  });
});

describe('GET /schema', () => {
  it('should respond success status code and the loaded schema', async () => {
    const schemaMock = { version: '3', fields: ['a', 'b'] };
    schemaService._loadSchema = jest.fn();
    schemaService._loadSchema.mockReturnValue(Promise.resolve(schemaMock))

    const response = await request.get(`/schema`);
    
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toEqual(schemaMock);
  });
});