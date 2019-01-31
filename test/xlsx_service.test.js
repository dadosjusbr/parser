const xslxService = require('../src/xlsx_service');
const { readFileAsync } = require('./test_utils');

describe('xlsx_service convertpreadsheetToJson should', () => {
    it('convert the buffered spreadsheet into json correctly', async () => {
        const bufferedSpreadsheet = await readFileAsync(__dirname + '/assets/plain_spreadsheet.xlsx');
        
        const tab1 = [['t1-a1', 't1-b1'], ['t1-a2', 't1-b2']];
        const tab2 = [['t2-a1', 't2-b1'], ['t2-a2', 't2-b2']];
        const expectedResult = [tab1, tab2];
        
        const result = xslxService.convertSpreadsheetToJson(bufferedSpreadsheet);
        
        expect(result).toEqual(expectedResult);
    });
});