const xlsx = require('xlsx');
const APIError = require('./api_error');
const httpStatus = require('http-status');

const convertSpreadsheetToJson = spreadsheetBuffer => {
  try {
    const workbook = xlsx.read(spreadsheetBuffer, { type: 'buffer' });
    const spreadsheetObj = {};
    workbook.SheetNames.forEach(sheetName => {
      spreadsheetObj[sheetName] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })
    });
    return spreadsheetObj;
  } catch (e) {
    throw new APIError(e.message, httpStatus.BAD_REQUEST, e.stack);   
  }
};

module.exports = { convertSpreadsheetToJson };