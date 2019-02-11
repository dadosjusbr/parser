const xlsx = require('xlsx');
const APIError = require('./APIError');
const httpStatus = require('http-status');

const convertSpreadsheetToJson = spreadsheetBuffer => {
  try {
    const workbook = xlsx.read(spreadsheetBuffer, { type: 'buffer' });
    return workbook.SheetNames.map(sheetName => xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 }));
  } catch (e) {
    throw new APIError(e.message, httpStatus.BAD_REQUEST, e.stack);   
  }
};

module.exports = { convertSpreadsheetToJson };