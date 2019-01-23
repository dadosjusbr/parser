const sinon = require('sinon');
const nock = require('nock');
const parserService = require('../src/parser_service');

describe('parser_service _fetchSpreadsheet should ', () => {
    it('return and resolve a promise containing the spreadsheet data', async () => {
        const url = 'http://www.test.com';
        const response = '<html> test </html>';

        // mocks the response from the url.
        nock(url).get('/').reply(200, response);
        
        const result = await parserService._fetchSpreadshet(url);
        expect(result).toEqual(Buffer.from(response));
    });
});
