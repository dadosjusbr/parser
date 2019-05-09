const http = require('http');
const httpStatus = require('http-status');
const jsonexport = require('jsonexport');
const xlsxService = require('./xlsx_service');
const APIError = require('./api_error');
const errorMessages = require('./error_messages');
const { parse } = require('./parser');

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
        const { message, code } = errorMessages.FETCH_SPREADSHEET_ERROR(err, url);
        reject(new APIError(message, httpStatus.BAD_REQUEST, code, err.stack));
      });
  });

const parseByUrl = async (req, res, next) => {
  const { spreadsheetUrl, headless } = req.query;
  try {
    if (!spreadsheetUrl) throw new APIError('Invalid spreadsheet url!', httpStatus.BAD_REQUEST);
    const spreadSheetBuffer = await _fetchSpreadshet(spreadsheetUrl);
    req.body = spreadSheetBuffer;
    next();
  } catch (e) {
    handleError(e, res);
  }
};

const getParsedSpreadsheet = async (req, res, next) => {
  const { headless } = req.query;
  try {
    const spreadSheetBuffer = req.body;
    const spreadSheet = xlsxService.convertSpreadsheetToJson(spreadSheetBuffer);
    const spreadSheetData = parse(spreadSheet);
    const csvOptions = {
      includeHeaders: headless !== 'true'
    };
    jsonexport(spreadSheetData, csvOptions, (err, csv) => {
      if (err) {
        const { message, code } = errorMessages.JSON_TO_CSV_ERROR(err);
        throw new APIError(message, httpStatus.INTERNAL_SERVER_ERROR, code);
      }
      res.set('Content-Type', 'text/csv');
      res.status(200).send(csv);
    });
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

module.exports = { getParsedSpreadsheet, _fetchSpreadshet, parseByUrl };