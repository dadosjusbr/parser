const express = require('express');
const app = express();

const parserService = require('./parser_service');

app.get('/', parserService.getParsedSpreadsheet);

module.exports = app;