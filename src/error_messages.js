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
}