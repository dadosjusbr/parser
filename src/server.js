const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')({
  prettyPrint: {
    levelFirst: true,
    colorize: true
  },
  prettifier: require('pino-pretty')
});

const parserService = require('./parser_service');
const schemaService = require('./schema_service');

const app = express();
app.use(pino)
app.use(bodyParser.raw({
  type: () => true, //accept any content type
  limit: '50mb'
}));

app.get('/', parserService.parseByUrl, parserService.getParsedSpreadsheet);
app.post('/', parserService.getParsedSpreadsheet);
app.get('/schema', schemaService.getSchema);

module.exports = app;