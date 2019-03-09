const xslxService = require('../src/xlsx_service');
const APIError = require('../src/api_error');
const httpStatus = require('http-status');
const {
  PLAIN_SPREADSHEET_PATH,
  EMPTY_SPREADSHEET_PATH,
  CORRUPTED_SPREADSHEET_PATH,
  PASSWORD_PROTECTED_SPREADSHEET_PATH,
  getSpreadsheet } = require('./spreadsheets');

describe('xlsx_service convertpreadsheetToJson should', () => {
  it('convert plain spreadsheet into json correctly', async () => {
    const bufferedSpreadsheet = await getSpreadsheet(PLAIN_SPREADSHEET_PATH);

    const tab1 = [['t1-a1', 't1-b1'], ['t1-a2', 't1-b2']];
    const tab2 = [['t2-a1', 't2-b1'], ['t2-a2', 't2-b2']];
    const expectedResult = {Sheet1: tab1, Sheet2: tab2};

    const result = xslxService.convertSpreadsheetToJson(bufferedSpreadsheet);

    expect(result).toEqual(expectedResult);
  });

  it('convert empty spreadsheet into json correctly', async () => {
    const bufferedSpreadsheet = await getSpreadsheet(EMPTY_SPREADSHEET_PATH);
    const tab1 = [];
    const expectedResult = {Sheet1: tab1};
    const result = xslxService.convertSpreadsheetToJson(bufferedSpreadsheet);
    expect(result).toEqual(expectedResult);
  });

  it('throw an APIError when the spreasheet file is corrupted', async () => {
    const bufferedSpreadsheet = await getSpreadsheet(CORRUPTED_SPREADSHEET_PATH);
    try {
      xslxService.convertSpreadsheetToJson(bufferedSpreadsheet);
      fail('an error should have been thrown by the function since the file is corrupted');
    } catch (e) {
      expect(e instanceof APIError).toBe(true);
      expect(e.status).toBe(httpStatus.BAD_REQUEST);
    }
  });

  it('thrown an APIError when the spreadsheet file is password protected', async () => {
    const bufferedSpreadsheet = await getSpreadsheet(PASSWORD_PROTECTED_SPREADSHEET_PATH);
    try {
      xslxService.convertSpreadsheetToJson(bufferedSpreadsheet);
      fail('an error should have been thrown by the function since the file is password protected');
    } catch (e) {
      expect(e instanceof APIError).toBe(true);
      expect(e.status).toBe(httpStatus.BAD_REQUEST);
      expect(e.message).toBe('File is password-protected');
    }
  });
});