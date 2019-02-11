const http = require('http');
const xlsxService = require('./xlsx_service');
const APIError = require('./APIError');
const httpStatus = require('http-status');

/**
 * Fetch the spreadsheet from the given url.
 * 
 * @param {string} url - spreadsheet url.
 * @return {Promise<Buffer>} - Promise containing the buffered spreadsheet data. 
 */
const _fetchSpreadshet = url => 
  new Promise((resolve, reject) => {
    http.get(url, res => {
      const data = [];

      res.on('data', chunk => {
        data.push(chunk);
      });

      res.on('end', () => {
        resolve(Buffer.concat(data));
      });
    })
    .on('error', err => {
      reject(new APIError(err.message, httpStatus.BAD_REQUEST, err.stack));
    });
  });

const getParsedSpreadsheet = async (req, res, next) => {
  const { spreadsheetUrl } = req.query;
  try {
    //TODO: validate spreadsheet url properly;
    if (!spreadsheetUrl) throw new APIError('Invalid spreadsheet url!', httpStatus.BAD_REQUEST);
    const spreadSheetBuffer = await _fetchSpreadshet(spreadsheetUrl);
    const spreadSheet = xlsxService.convertSpreadsheetToJson(spreadSheetBuffer);
    
    res.set('Content-Type', 'text/csv');
    res.status(200).send('this will be a csv file');
  } catch (e) {
    next(e);
  }
};

module.exports = { getParsedSpreadsheet, _fetchSpreadshet };