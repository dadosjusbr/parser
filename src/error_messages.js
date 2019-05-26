module.exports = {
  HEADER_SIZE_ERROR: (expectedSize, foundSize, sheetName) => ({
    message: `The ${sheetName} sheet header should have the size (${expectedSize}) but found (${foundSize})`,
    code: 1
  }),
  FETCH_SPREADSHEET_ERROR: (fetchingError, spreadsheetUrl) => ({
    message: `The following error was found when fetching this spreadsheet: (${spreadsheetUrl}) [${fetchingError}]`,
    code: 2
  }),
  XLSX_TO_JSON_ERROR: parsingError => ({
    message: `The following error was found when converting the spreadsheet to JSON: [${parsingError}]`,
    code: 3
  }),
  JSON_TO_CSV_ERROR: error => ({
    message: `The following error was found when converting the JSON data to CSV: [${error}]`,
    code: 4
  }),
  SPREASHEET_DATA_NOT_FOUND: data => ({
    message: `The following data was not found on the spreadsheet: [${data}]`,
    code: 5
  }),
  SHEET_NOT_FOUND: sheetName => ({
    message: `The following sheet was not found on the spreadsheet: [${sheetName}]`,
    code: 6
  }),
}