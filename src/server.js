const express = require('express');

const app = express();

const parserService = require('./parser_service');
const schemaService = require('./schema_service');

app.get('/', parserService.getParsedSpreadsheet);
app.get('/schema', schemaService.getSchema);

module.exports = app;