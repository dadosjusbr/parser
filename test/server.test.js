const supertest = require('supertest');
const nock = require('nock');
const app = require('../src/server');
const { getSpreadsheet, SIMPLE_DATA_SPREADSHEET_PATH } = require('./spreadsheets');

const schemaService = require('../src/schema_service.js');
const schema = require('../src/schema.js');

const server = app.listen();
const request = supertest.agent(server)

afterAll(function(done){
  server.close(done)
});

describe('GET /', () => {
  const url = 'http://www.cnj.jus.br/files/conteudo/arquivo/2019/02/6b096d01d86be13ddf695185449a5a2b.xls';

  it('Should respond success status code and the correct message', async () => {
    const spreadsheet = await getSpreadsheet(SIMPLE_DATA_SPREADSHEET_PATH);
    nock(url).get('').reply(200, spreadsheet);
    const response = await request.get(`/?spreadsheetUrl=${url}`);
    expect(response.statusCode).toBe(200);
    //TODO: assert csv response
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
    const response = await request.get(`/schema`);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toEqual(schema);
  });
});