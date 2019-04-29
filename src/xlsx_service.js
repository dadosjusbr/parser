const xlsx = require('xlsx');
const APIError = require('./api_error');
const httpStatus = require('http-status');
const errorMessages = require('./error_messages');
const convertSpreadsheetToJson = spreadsheetBuffer => {
  try {
    const workbook = xlsx.read(spreadsheetBuffer, { type: 'buffer' });
    const spreadsheetObj = {};
    workbook.SheetNames.forEach(sheetName => {
      spreadsheetObj[sheetName] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })
    });
    return spreadsheetObj;
  } catch (e) {
    const {message, code} = errorMessages.XLSX_TO_JSON_ERROR(e);
    throw new APIError(message, httpStatus.BAD_REQUEST, code, e.stack);   
  }
};

module.exports = { convertSpreadsheetToJson };