const express = require('express');
const app = express();

const parserService = require('./parser.service');

app.get('/', parserService.getParsedSpreadsheet);

module.exports = app;