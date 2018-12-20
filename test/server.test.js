const supertest = require('supertest');

const app = require('../src/server');

describe('GET /', () => {
    let request;
    let server;
  
    beforeAll(function(done){
      server = app.listen(done)
      request = supertest.agent(server)
    });
  
    afterAll(function(done){
      server.close(done)
    });

    test('It should response success status code and the correct message', async () => {
        const response = await request.get('/');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('this will be a csv file');
    });
});