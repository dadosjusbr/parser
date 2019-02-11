const express = require('express');
const httpStatus = require('http-status');
const APIError = require('./APIError');

const app = express();

const parserService = require('./parser_service');

app.get('/', parserService.getParsedSpreadsheet);

app.use((err, req, res, next) => {
  const status = err instanceof APIError ? err.status : httpStatus.INTERNAL_SERVER_ERROR;
  
  res.status(status).json({
    message: err.message,
    stack: err.stack
  });
});

module.exports = app;