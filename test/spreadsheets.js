const fs = require('fs');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);

module.exports = {
    PLAIN_SPREADSHEET_PATH: '/assets/plain_spreadsheet.xlsx',
    EMPTY_SPREADSHEET_PATH: '/assets/empty_spreadsheet.xlsx',
    CORRUPTED_SPREADSHEET_PATH: '/assets/corrupted_spreadsheet.xlsx',
    
    getSpreadsheet: path => readFileAsync(__dirname + path) 
};