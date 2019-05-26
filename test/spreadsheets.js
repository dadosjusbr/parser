const fs = require('fs');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);

module.exports = {
    PLAIN_SPREADSHEET_PATH: '/assets/plain_spreadsheet.xlsx',
    EMPTY_SPREADSHEET_PATH: '/assets/empty_spreadsheet.xlsx',
    CORRUPTED_SPREADSHEET_PATH: '/assets/corrupted_spreadsheet.xlsx',
    PASSWORD_PROTECTED_SPREADSHEET_PATH: '/assets/password_protected_spreadsheet.xls',
    SIMPLE_DATA_SPREADSHEET_PATH: '/assets/simple_data_spreadsheet.xlsx',
    MISSING_DATA_SPREADSHEET_PATH: '/assets/missing_data_spreadsheet.xlsx',

    SUBSIDIO_HEADERS_1: '/assets/subsidio_headers/header1.xlsx',
    SUBSIDIO_HEADERS_2: '/assets/subsidio_headers/header2.xlsx',
    SUBSIDIO_HEADERS_3: '/assets/subsidio_headers/header3.xlsx',
    SUBSIDIO_HEADERS_4: '/assets/subsidio_headers/header4.xlsx',
    SUBSIDIO_HEADERS_5: '/assets/subsidio_headers/header5.xlsx',
    SUBSIDIO_HEADERS_6: '/assets/subsidio_headers/header6.xlsx',
    SUBSIDIO_HEADERS_7: '/assets/subsidio_headers/header7.xlsx',
    SUBSIDIO_HEADERS_8: '/assets/subsidio_headers/header8.xlsx',
    SUBSIDIO_HEADERS_9: '/assets/subsidio_headers/header9.xlsx',
    SUBSIDIO_HEADERS_10: '/assets/subsidio_headers/header10.xlsx',
    SUBSIDIO_HEADERS_11: '/assets/subsidio_headers/header11.xlsx',
    SUBSIDIO_HEADERS_12: '/assets/subsidio_headers/header12.xlsx',

    INDENIZACOES_HEADERS_1: '/assets/indenizacoes_headers/header1.xlsx',
    INDENIZACOES_HEADERS_2: '/assets/indenizacoes_headers/header2.xlsx',
    INDENIZACOES_HEADERS_3: '/assets/indenizacoes_headers/header3.xlsx',
    INDENIZACOES_HEADERS_4: '/assets/indenizacoes_headers/header4.xlsx',
    INDENIZACOES_HEADERS_5: '/assets/indenizacoes_headers/header5.xlsx',
    INDENIZACOES_HEADERS_6: '/assets/indenizacoes_headers/header6.xlsx',
    INDENIZACOES_HEADERS_7: '/assets/indenizacoes_headers/header7.xlsx',
    INDENIZACOES_HEADERS_8: '/assets/indenizacoes_headers/header8.xlsx',
    INDENIZACOES_HEADERS_9: '/assets/indenizacoes_headers/header9.xlsx',
    INDENIZACOES_HEADERS_10: '/assets/indenizacoes_headers/header10.xlsx',
    INDENIZACOES_HEADERS_11: '/assets/indenizacoes_headers/header11.xlsx',
    INDENIZACOES_HEADERS_12: '/assets/indenizacoes_headers/header12.xlsx',
    INDENIZACOES_HEADERS_13: '/assets/indenizacoes_headers/header13.xlsx',
    INDENIZACOES_HEADERS_14: '/assets/indenizacoes_headers/header14.xlsx',

    DIREITOS_EVENTUAIS_HEADER_1: '/assets/direitos_eventuais_headers/header1.xlsx',

    getSpreadsheet: path => readFileAsync(__dirname + path)
};