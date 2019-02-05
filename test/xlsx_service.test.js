const xslxService = require('../src/xlsx_service');
const {
    PLAIN_SPREADSHEET_PATH, 
    EMPTY_SPREADSHEET_PATH, 
    CORRUPTED_SPREADSHEET_PATH,
    getSpreadsheet } = require('./spreadsheets');

describe('xlsx_service convertpreadsheetToJson should', () => {
    it('convert plain spreadsheet into json correctly', async () => {
        const bufferedSpreadsheet = await getSpreadsheet(PLAIN_SPREADSHEET_PATH);
        
        const tab1 = [['t1-a1', 't1-b1'], ['t1-a2', 't1-b2']];
        const tab2 = [['t2-a1', 't2-b1'], ['t2-a2', 't2-b2']];
        const expectedResult = [tab1, tab2];
        
        const result = xslxService.convertSpreadsheetToJson(bufferedSpreadsheet);
        
        expect(result).toEqual(expectedResult);
    });

    it('convert empty spreadsheet into json correctly', async () => {
        const bufferedSpreadsheet = await getSpreadsheet(EMPTY_SPREADSHEET_PATH);
        const tab1 = [];
        const expectedResult = [tab1];
        const result = xslxService.convertSpreadsheetToJson(bufferedSpreadsheet);
        expect(result).toEqual(expectedResult);
    });

    it('throw an error when the spreasheet file is corrupted', async () => {
        const bufferedSpreadsheet = await getSpreadsheet(CORRUPTED_SPREADSHEET_PATH);
        try {
            xslxService.convertSpreadsheetToJson(bufferedSpreadsheet);
            fail('an error should have been thrown by the function since the file is corrupted');
        } catch (e) {}
    });
});