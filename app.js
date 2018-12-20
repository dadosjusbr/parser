const express = require('express');

const parserService = require('./src/parser.service');

const app = express();

app.get('/', parserService.getParsedSpreadsheet);

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`running on port: ${port}`);
});