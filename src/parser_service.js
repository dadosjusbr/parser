const http = require('http');
const xlsxService = require('./xlsx_service');
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
      reject(err);
    });
  });

const getParsedSpreadsheet = async (req, res) => {
  try {
    //TODO: validate spreadsheet url properly;
    const { spreadsheetUrl } = req.query;
    if (!spreadsheetUrl) throw new Error('Invalid spreadsheet url!');

    const spreadSheetBuffer = await _fetchSpreadshet(spreadsheetUrl);

    const spreadSheet = xlsxService.convertSpreadsheetToJson(spreadSheetBuffer);

    res.set('Content-Type', 'text/csv');
    res.status(200).send('this will be a csv file');
  } catch (e) {
    res.status(400).send(e.message);
  }
};

module.exports = { getParsedSpreadsheet, _fetchSpreadshet };