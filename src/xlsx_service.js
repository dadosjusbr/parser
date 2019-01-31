const xlsx = require('xlsx');

const convertSpreadsheetToJson = spreadsheetBuffer => {
    const workbook = xlsx.read(spreadsheetBuffer, {type: 'buffer'});
    return workbook.SheetNames.map(sheetName => xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {header:1}));
};

module.exports = { convertSpreadsheetToJson };