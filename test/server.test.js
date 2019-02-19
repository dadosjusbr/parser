const supertest = require('supertest');
const nock = require('nock');

const app = require('../src/server');

describe('GET /', () => {
  const url = 'http://www.test.com';
  
  let request;
  let server;
  
  beforeAll(function(done){
    server = app.listen(done)
    request = supertest.agent(server)
    nock(url).get('/').reply(200, '');
  });

  afterAll(function(done){
    server.close(done)
  });

  it('Should response success status code and the correct message', async () => {
    const response = await request.get(`/?spreadsheetUrl=${url}`);
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('this will be a csv file');
  });


  it('Should response bad request status code when no url is passed in query params', async () => {
    const response = await request.get('/');
    expect(response.statusCode).toBe(400);
    const responseObj = JSON.parse(response.text);
    expect(responseObj.message).toEqual('Invalid spreadsheet url!');
  });
});