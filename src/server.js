const express = require('express');
const httpStatus = require('http-status');
const APIError = require('./APIError');

const app = express();

const parserService = require('./parser_service');

app.get('/', parserService.getParsedSpreadsheet);

module.exports = app;