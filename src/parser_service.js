const http = require('http');
const xlsxService = require('./xlsx_service');
const APIError = require('./api_error');
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
    handleError(e, res);
  }
};

const handleError = (err, res) => {
  const status = err instanceof APIError ? err.status : httpStatus.INTERNAL_SERVER_ERROR;
  
  res.status(status).json({
    message: err.message,
    stack: err.stack
  });
};

const { promisify } = require('util');
const fs = require('fs');
const parser = require('./parser');

const spreadSheetIterator = async () => {
  const spreasheetsPath = __dirname + '/spreadsheets';
  const filesPaths = await promisify(fs.readdir)(spreasheetsPath);
  console.log(filesPaths);
  const promises = filesPaths.map(filePath => promisify(fs.readFile)(`${spreasheetsPath}/${filePath}`));
  const files = await Promise.all(promises);
  console.log(files);
  const set = new Set();
  const fileNamesCols = {};
  files.forEach((file, index) => {
    try {
      //if(index > 30) return;
      //if(filesPaths[index] !== '79572b97c96c5979d3fd9e00e101d4e2.xls') return;
      //if(filesPaths[index] !== 'fe23d47849cc45a194634d0b07589b46.xls') return;
      console.log('===================== ' + filesPaths[index]);
      const spreadsheet = xlsxService.convertSpreadsheetToJson(file);
      const subsidio = parser._getSubsidioData(spreadsheet);
      const sheet = parser._getSheet('pessoais', spreadsheet);
      const header = parser._getHeader(sheet);
      set.add(JSON.stringify(header));
      fileNamesCols[JSON.stringify(header)] = 
        fileNamesCols[JSON.stringify(header)] ? [...fileNamesCols[JSON.stringify(header)], filesPaths[index]] : [filesPaths[index]];  
      //console.log(contracheque);
      //console.log(filesPaths[index] + ' -> ok');
      console.log(subsidio);
      //console.log(filesPaths[index]);
    } catch (e) {
      console.log(filesPaths[index] + ' -> error');
      console.log(e);
    }
  });
  //console.log(JSON.stringify(fileNamesCols));
  //console.log([...set]);
  //console.log([...set].length);
  //console.log(spreadSheets);
};

spreadSheetIterator();

module.exports = { getParsedSpreadsheet, _fetchSpreadshet };