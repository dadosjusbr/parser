const parser = require('../src/parser');
const {
  getSpreadsheet, SIMPLE_DATA_SPREADSHEET_PATH, MISSING_DATA_SPREADSHEET_PATH,

  MISSING_CONTRACHQUE_SHEET_SPREADSHEET_PATH, MISSING_SUBSIDIOS_SHEET_SPREADSHEET_PATH,
  MISSING_INDENIZACOES_SHEET_SPREADSHEET_PATH, MISSING_DIREITOS_EVENTUAIS_SHEET_SPREADSHEET_PATH,
  MISSING_DADOS_CADASTRAIS_SHEET_SPREADSHEET_PATH,

  SUBSIDIO_HEADERS_1, SUBSIDIO_HEADERS_2, SUBSIDIO_HEADERS_3, SUBSIDIO_HEADERS_4,
  SUBSIDIO_HEADERS_5, SUBSIDIO_HEADERS_6, SUBSIDIO_HEADERS_7, SUBSIDIO_HEADERS_8,
  SUBSIDIO_HEADERS_9, SUBSIDIO_HEADERS_10, SUBSIDIO_HEADERS_11, SUBSIDIO_HEADERS_12,

  INDENIZACOES_HEADERS_1, INDENIZACOES_HEADERS_2, INDENIZACOES_HEADERS_3, INDENIZACOES_HEADERS_4,
  INDENIZACOES_HEADERS_5, INDENIZACOES_HEADERS_6, INDENIZACOES_HEADERS_7, INDENIZACOES_HEADERS_8,
  INDENIZACOES_HEADERS_9, INDENIZACOES_HEADERS_10, INDENIZACOES_HEADERS_11, INDENIZACOES_HEADERS_12,
  INDENIZACOES_HEADERS_13, INDENIZACOES_HEADERS_14,

  DIREITOS_EVENTUAIS_HEADER_1,
} = require('./spreadsheets');
const { convertSpreadsheetToJson } = require('../src/xlsx_service');
const APIError = require('../src/api_error');
const errorMessages = require('../src/error_messages');
const httpStatus = require('http-status');

describe('parser _getHeaderLine ', () => {
  it('should return undefined if the sheet is empty', () => {
    const emptySheet1 = [],
      emptySheet2 = [[]],
      emptySheet3 = [[], [], []],
      emptySheet4 = [['', '', ''], []];

    [emptySheet1, emptySheet2, emptySheet3, emptySheet4].forEach(sheet => {
      expect(parser._getHeaderLine(sheet)).toBe(undefined);
    });
  });

  it('should return undefined if the sheet not contains the header', () => {
    const sheetMock = [
      ['anything', 'anything2'],
      ['otherstuff', 'anything2'],
      ['cpf', 'notName'],
      ['not the word above', 'nome']
    ];
    expect(parser._getHeaderLine(sheetMock)).toBe(undefined);
  });

  it('should return the line containing the sheet header', () => {
    const sheetMock1 = [['cpf', 'nome']],
      sheetMock2 = [['anything', 'anything2'], ['cpf', 'nome']],
      sheetMock3 = [['anything', 'anything2'], ['anything', 'anything2'], ['cpf', 'nome']];

    [sheetMock1, sheetMock2, sheetMock3].forEach((sheet, index) => {
      expect(parser._getHeaderLine(sheet)).toBe(index + 1);
    });
  });

  it('should return the line containing the sheet header even when more than one line matches with the header', () => {
    const sheetMock = [
      ['beforeHeader1', 'beforeHeader2'],
      ['cpf', 'nome'],
      ['cpf', 'nome'],
      ['cpf', 'nome'],
      ['cpf', 'nome'],
      ['cpf', 'nome'],
      ['data1', 'data2'],
    ];
    expect(parser._getHeaderLine(sheetMock)).toBe(sheetMock.length - 1);
  });

  it('should return the line containing the sheet header even when the cell value is dirty', () => {
    const sheetMock = [
      ['CPF (só números)', 'Nome with anything']
    ];
    expect(parser._getHeaderLine(sheetMock)).toBe(sheetMock.length);
  });

  it('should return the line containing the sheet header even when other cells have numeric values', () => {
    const sheetMock = [
      [1, 2],
      ['CPF', 'Nome']
    ];
    expect(parser._getHeaderLine(sheetMock)).toBe(sheetMock.length);
  });
});

describe('parser _getSheet', () => {
  it('should return an empty array when an empty spreadsheet is passed', () => {
    expect(parser._getSheet('asdf', {})).toEqual([]);
  });

  it('should return the last sheet when an empty keyword is passed', () => {
    const spreadsheetMock = {
      firstSheet: [['a'], ['b']],
      secondSheet: [['c'], ['d']],
      lastSheet: [['e'], ['f']]
    };
    expect(parser._getSheet('', spreadsheetMock)).toBe(spreadsheetMock.lastSheet);
  });

  it('should return the sheet that matches with the passed keyword in the name', () => {
    const spreadsheetMock = {
      anyName: [['a'], ['b']],
      theRightOne: [['c'], ['d']],
      otherName: [['e'], ['f']]
    };
    expect(parser._getSheet('right', spreadsheetMock)).toBe(spreadsheetMock.theRightOne);
  });

  it('should return the sheet that matches with the passed keyword in the title', () => {
    const spreadsheetMock = {
      anyName: [['a'], ['b']],
      someName: [['c'], ['d']],
      otherName: [['im am the right one'], ['f']]
    };
    expect(parser._getSheet('im am the', spreadsheetMock)).toBe(spreadsheetMock.otherName);
  });
});

describe('paser _getSheetData', () => {
  it('should return an empty array if the sheet has no data', () => {
    const sheetMock = [
      ['asdf', 'asdf'],
      ['fsda', 'fasd'],
      ['cpf', 'nome'], //header 
      [],
      []
    ];

    const sheetModel = [
      { fieldName: 'campo1' },
      { fieldName: 'campo2' },
    ];

    expect(parser._getSheetData(sheetModel, sheetMock)).toEqual([]);
    expect(parser._getSheetData(sheetModel, [])).toEqual([]);
  });

  it('should convert the sheet into an array of data', () => {
    const sheetMock = [
      ['asdf', 'asdf'],
      ['fsda', 'fasd'],
      ['cpf', 'nome'], //header
      ['dados11', 'dados12'],
      ['dados21', 'dados22'],
      ['dados31', 'dados32'],
      ['dados41'],
      []
    ];
    const sheetModel = [
      { fieldName: 'campo1' },
      { fieldName: 'campo2' },
    ];

    const data = parser._getSheetData(sheetModel, sheetMock);

    expect(data).toEqual([
      { campo1: 'dados11', campo2: 'dados12' },
      { campo1: 'dados21', campo2: 'dados22' },
      { campo1: 'dados31', campo2: 'dados32' }
    ]);
  });

  it('should remove lines that are not data', () => {
    const sheetMock = [
      ['asdf', 'asdf'],
      ['fsda', 'fasd'],
      ['cpf', 'nome'], //header
      [0, 'dados12'],
      ['dados21', 'dados22'],
      ['dados31', 'dados32'],
      [0, 'dados42'],
      ['dados51', 'dados52'],
      []
    ];
    const sheetModel = [
      { fieldName: 'campo1' },
      { fieldName: 'campo2' },
    ];

    const data = parser._getSheetData(sheetModel, sheetMock);

    expect(data).toEqual([
      { campo1: 0, campo2: 'dados12' },
      { campo1: 'dados21', campo2: 'dados22' },
      { campo1: 'dados31', campo2: 'dados32' },
      { campo1: 0, campo2: 'dados42' },
      { campo1: 'dados51', campo2: 'dados52' }
    ]);
  });
});

describe('parser _getContrachequeData', () => {
  it('should collect the contracheque data from the spreadsheet', async () => {
    const spreadsheetBuffer = await getSpreadsheet(SIMPLE_DATA_SPREADSHEET_PATH);
    const spreadsheet = convertSpreadsheetToJson(spreadsheetBuffer);

    const expectedContrachequeData = [
      { cargo: "Juiz Eleitoral", cpf: "xxx.xxx.xxx-xx", descontos_diversos: 41, diarias: 81, direitos_eventuais: 792, direitos_pessoais: 63.5, imposto_de_renda: 31, indenizacoes: 459, lotacao: "CARTÓRIO ELEITORAL", nome: "Nome1", previdencia_publica: 21, remuneracao_do_orgao_de_origem: 71, rendimento_liquido: 1264.5, retencao_por_teto_constitucional: 51, subsidio: 11, total_de__rendimentos: 1325.5, total_de_descontos: 61 },
      { cargo: "Juiz Eleitoral", cpf: "xxx.xxx.xxx-xx", descontos_diversos: 42, diarias: 82, direitos_eventuais: 804, direitos_pessoais: 66, imposto_de_renda: 32, indenizacoes: 468, lotacao: "CARTÓRIO ELEITORAL", nome: "Nome2", previdencia_publica: 22, remuneracao_do_orgao_de_origem: 72, rendimento_liquido: 1288, retencao_por_teto_constitucional: 52, subsidio: 12, total_de__rendimentos: 1350, total_de_descontos: 62 },
      { cargo: "Juiz Eleitoral", cpf: "xxx.xxx.xxx-xx", descontos_diversos: 43, diarias: 83, direitos_eventuais: 816, direitos_pessoais: 69, imposto_de_renda: 33, indenizacoes: 477, lotacao: "CARTÓRIO ELEITORAL", nome: "Nome3", previdencia_publica: 23, remuneracao_do_orgao_de_origem: 73, rendimento_liquido: 1312, retencao_por_teto_constitucional: 53, subsidio: 13, total_de__rendimentos: 1375, total_de_descontos: 63 },
      { cargo: "Juiz Eleitoral", cpf: "xxx.xxx.xxx-xx", descontos_diversos: 44, diarias: 84, direitos_eventuais: 828, direitos_pessoais: 72, imposto_de_renda: 34, indenizacoes: 486, lotacao: "CARTÓRIO ELEITORAL", nome: "nome4", previdencia_publica: 24, remuneracao_do_orgao_de_origem: 74, rendimento_liquido: 1336, retencao_por_teto_constitucional: 54, subsidio: 14, total_de__rendimentos: 1400, total_de_descontos: 64 }
    ];

    expect(parser._getContrachequeData(spreadsheet)).toEqual(expectedContrachequeData);
  });

  it('should throw an error when contracheque sheet is no found', async () => {
    const spreadsheetBuffer = await getSpreadsheet(MISSING_CONTRACHQUE_SHEET_SPREADSHEET_PATH);
    const spreadsheet = convertSpreadsheetToJson(spreadsheetBuffer);
    try {
      parser._getContrachequeData(spreadsheet);
      fail('an error should be thrown');
    } catch (e) {
      const { message, code } = errorMessages.SHEET_NOT_FOUND('contracheque');
      expect(e).toEqual(new APIError(message, 404, code));
    }
  });
});

describe('parser _getSubsidioData', () => {
  const testSubsidioData = async (spreadsheetPath, expectedData) => {
    const spreadsheetBuffer = await getSpreadsheet(spreadsheetPath);
    const spreadsheet = convertSpreadsheetToJson(spreadsheetBuffer);
    expect(parser._getSubsidioData(spreadsheet)).toEqual(expectedData);
  };

  it('should collect the subsidio data from the spreadsheet', () => {
    const simpleSubsidioData = [
      { abono_de_permanencia: 11.5, cpf: "xxx.xxx.xxx-xx", nome: "Nome1", subsidio_detalhes: "asdf1 | qwer1", subsidio_outras: 52, total_de_direitos_pessoais: 63.5 },
      { abono_de_permanencia: 12, cpf: "xxx.xxx.xxx-xx", nome: "Nome2", subsidio_detalhes: "asdf2 | qwer2", subsidio_outras: 54, total_de_direitos_pessoais: 66 },
      { abono_de_permanencia: 13, cpf: "xxx.xxx.xxx-xx", nome: "Nome3", subsidio_detalhes: "asdf3 | qwer3", subsidio_outras: 56, total_de_direitos_pessoais: 69 },
      { abono_de_permanencia: 14, cpf: "xxx.xxx.xxx-xx", nome: "nome4", subsidio_detalhes: "asdf4 | qwer4", subsidio_outras: 58, total_de_direitos_pessoais: 72 }
    ];
    testSubsidioData(SIMPLE_DATA_SPREADSHEET_PATH, simpleSubsidioData);
  });

  it('should throw an error when subsidios sheet is no found', async () => {
    const spreadsheetBuffer = await getSpreadsheet(MISSING_SUBSIDIOS_SHEET_SPREADSHEET_PATH);
    const spreadsheet = convertSpreadsheetToJson(spreadsheetBuffer);
    try {
      parser._getSubsidioData(spreadsheet);
      fail('an error should be thrown');
    } catch (e) {
      const { message, code } = errorMessages.SHEET_NOT_FOUND('subsidios');
      expect(e).toEqual(new APIError(message, 404, code));
    }
  });

  describe('parser _getSubsidioData with diferent headers', () => {
    const regularSubsidioData = [
      { abono_de_permanencia: 11, cpf: "xxx.xxx.xxx-xx", nome: "Nome1", subsidio_detalhes: "", subsidio_outras: 0, total_de_direitos_pessoais: 11 },
      { abono_de_permanencia: 12, cpf: "xxx.xxx.xxx-xx", nome: "Nome2", subsidio_detalhes: "a | b", subsidio_outras: 0, total_de_direitos_pessoais: 12 },
      { abono_de_permanencia: 13, cpf: "xxx.xxx.xxx-xx", nome: "Nome3", subsidio_detalhes: "abc | def", subsidio_outras: 3, total_de_direitos_pessoais: 16 },
      { abono_de_permanencia: 14, cpf: "xxx.xxx.xxx-xx", nome: "Nome4", subsidio_detalhes: "some sentence | other sentence with more words", subsidio_outras: 19.3, total_de_direitos_pessoais: 33.3 }
    ];

    it(`should parse subsidio sheet with the given header: [cpf, nome, Abono de permanência (R$), Outra (R$), Detalhe, Outra (R$), Detalhe, Total de Direitos Pessoais]`, async () => {
      testSubsidioData(SUBSIDIO_HEADERS_1, regularSubsidioData);
    });

    it(`should parse subsidio sheet with the given header: [cpf, nome, Abono de permanência (R$), Outra (R$), Detalhe, Outra (R$), Detalhe, Total Vantagens Pessoais]`, async () => {
      testSubsidioData(SUBSIDIO_HEADERS_2, regularSubsidioData);
    });

    it(`should parse subsidio sheet with the given header: [cpf, nome, Abono de permanência (R$), Outra 1 DIR.PES. (R$), Detalhe,Outra 2 DIR.PES. (R$), Detalhe,Total de Direitos Pessoais]`, async () => {
      testSubsidioData(SUBSIDIO_HEADERS_3, regularSubsidioData);
    });

    it(`should parse subsidio sheet with the given header: [cpf, nome, Abono de permanência (R$), Vantagens Art. 184, I, e 192, I, Lei 1.711/52 (R$), Detalhe,Outra (R$), Detalhe, Total de Direitos Pessoais]`, async () => {
      testSubsidioData(SUBSIDIO_HEADERS_4, regularSubsidioData);
    });

    it(`should parse subsidio sheet with the given header: [cpf ,nome ,Abono de permanência (R$) ,Outra (R$) ,Detalhe ,Outra (R$) ,Detalhe ,Total de Direitos Pessoais, OBSERVAÇÃO:...]`, async () => {
      testSubsidioData(SUBSIDIO_HEADERS_5, regularSubsidioData);
    });

    it(`should parse subsidio sheet with the given header: [cpf, nome, Abono de permanência (R$), Outra (R$), Detalhe,Outra (R$), Detalhe,Outra (R$), Detalhe, Outra (R$), Detalhe,Total de Direitos Pessoais]`, async () => {
      const expectedSubsidioData = [
        { abono_de_permanencia: 11, cpf: "xxx.xxx.xxx-xx", nome: "Nome1", subsidio_detalhes: "", subsidio_outras: 0, total_de_direitos_pessoais: 11 },
        { abono_de_permanencia: 12, cpf: "xxx.xxx.xxx-xx", nome: "Nome2", subsidio_detalhes: "a | b | c | d", subsidio_outras: 0, total_de_direitos_pessoais: 12 },
        { abono_de_permanencia: 13, cpf: "xxx.xxx.xxx-xx", nome: "Nome3", subsidio_detalhes: "ab | cd | ef | gh", subsidio_outras: 10, total_de_direitos_pessoais: 23 },
        { abono_de_permanencia: 14, cpf: "xxx.xxx.xxx-xx", nome: "Nome4", subsidio_detalhes: "detalhe one | detalhe two | detalhe three | detalhe four", subsidio_outras: 11, total_de_direitos_pessoais: 25 }
      ];
      testSubsidioData(SUBSIDIO_HEADERS_6, expectedSubsidioData);
    });

    it(`should parse subsidio sheet with the given header: [cpf, nome, Abono de permanência (R$), Outra (R$), Detalhe,Outra (R$), Detalhe, Total Direitos Pessoais]`, async () => {
      testSubsidioData(SUBSIDIO_HEADERS_7, regularSubsidioData);
    });

    it(`should parse subsidio sheet with the given header: [cpf, nome, Abono de permanência, Outra - Detalhe, Outra - (R$), Total de Direitos Pessoais]`, async () => {
      const expectedSubsidioData = [
        { abono_de_permanencia: 11, cpf: "xxx.xxx.xxx-xx", nome: "Nome1", subsidio_detalhes: "", subsidio_outras: 0, total_de_direitos_pessoais: 11 },
        { abono_de_permanencia: 12, cpf: "xxx.xxx.xxx-xx", nome: "Nome2", subsidio_detalhes: "", subsidio_outras: 0, total_de_direitos_pessoais: 12 },
        { abono_de_permanencia: 13, cpf: "xxx.xxx.xxx-xx", nome: "Nome3", subsidio_detalhes: "2", subsidio_outras: 1, total_de_direitos_pessoais: 16 },
        { abono_de_permanencia: 14, cpf: "xxx.xxx.xxx-xx", nome: "Nome4", subsidio_detalhes: "2.4", subsidio_outras: 3.5, total_de_direitos_pessoais: 19.9 }
      ];
      testSubsidioData(SUBSIDIO_HEADERS_8, expectedSubsidioData);
    });

    it(`should parse subsidio sheet with the given header: [cpf, nome, Abono de permanência (R$), Vant. Art. 192, Inda Lei 8.112/90, Detalhe, Outra (R$), Detalhe, Total de Direitos Pessoais]`, async () => {
      testSubsidioData(SUBSIDIO_HEADERS_9, regularSubsidioData);
    });

    it(`should parse subsidio sheet with the given header: [cpf, nome, Abono de permanência (R$), Outra (R$), Detalhe, Outra (R$), Detalhe, Outra (R$), Detalhe, Total de Direitos Pessoais]`, async () => {
      const expectedSubsidioData = [
        { abono_de_permanencia: 11, cpf: "xxx.xxx.xxx-xx", nome: "Nome1", subsidio_detalhes: "", subsidio_outras: 0, total_de_direitos_pessoais: 11 },
        { abono_de_permanencia: 12, cpf: "xxx.xxx.xxx-xx", nome: "Nome2", subsidio_detalhes: "a | b | c", subsidio_outras: 0, total_de_direitos_pessoais: 12 },
        { abono_de_permanencia: 13, cpf: "xxx.xxx.xxx-xx", nome: "Nome3", subsidio_detalhes: "ab | cd | ef", subsidio_outras: 6, total_de_direitos_pessoais: 19 },
        { abono_de_permanencia: 14, cpf: "xxx.xxx.xxx-xx", nome: "Nome4", subsidio_detalhes: "detalhe one | detalhe two | detalhe three", subsidio_outras: 35.3, total_de_direitos_pessoais: 49.3 }
      ];
      testSubsidioData(SUBSIDIO_HEADERS_10, expectedSubsidioData);
    });

    it(`should parse subsidio sheet with the given header: [cpf, nome, Abono de permanência (R$), Abono de Permanência-GNAT (R$), Detalhe, Outra (R$), Detalhe, Total de Direitos Pessoais]`, async () => {
      testSubsidioData(SUBSIDIO_HEADERS_11, regularSubsidioData);
    });

    it(`should parse subsidio sheet with the given header: [cpf, nome, Abono de permanência (R$), Outra (R$), Detalhe, Outra (R$), Detalhe, Outra (R$), Detalhe, Outra (R$), Detalhe, Outra (R$), Detalhe, Total de Direitos Pessoais]`, async () => {
      const expectedSubsidioData = [
        { abono_de_permanencia: 11, cpf: "xxx.xxx.xxx-xx", nome: "Nome1", subsidio_detalhes: "", subsidio_outras: 0, total_de_direitos_pessoais: 11 },
        { abono_de_permanencia: 12, cpf: "xxx.xxx.xxx-xx", nome: "Nome2", subsidio_detalhes: "a | b | c | d | e", subsidio_outras: 0, total_de_direitos_pessoais: 12 },
        { abono_de_permanencia: 13, cpf: "xxx.xxx.xxx-xx", nome: "Nome3", subsidio_detalhes: "ab | cd | ef | gh | ij", subsidio_outras: 15, total_de_direitos_pessoais: 28 },
        { abono_de_permanencia: 14, cpf: "xxx.xxx.xxx-xx", nome: "Nome4", subsidio_detalhes: "detalhe one | detalhe two | detalhe three | detalhe four | detalhe five", subsidio_outras: 6.5, total_de_direitos_pessoais: 20.5 }
      ];
      testSubsidioData(SUBSIDIO_HEADERS_12, expectedSubsidioData);
    });
  });
});

describe('parser _cleanData', () => {
  it('should return the same number as passed', () => {
    expect(parser._cleanData(2, 'number')).toBe(2);
  });

  it('should return zero if the data passed is falsy and the type is "number"', () => {
    expect(parser._cleanData(undefined, 'number')).toBe(0);
    expect(parser._cleanData(false, 'number')).toBe(0);
    expect(parser._cleanData("", 'number')).toBe(0);
    expect(parser._cleanData(null, 'number')).toBe(0);
  });

  it('should return the same string as passed', () => {
    expect(parser._cleanData('olar', 'text')).toBe('olar');
  });

  it('should return empty string if the data passed is falsy and the type is "text"', () => {
    expect(parser._cleanData(undefined, 'text')).toBe('');
    expect(parser._cleanData(false, 'text')).toBe('');
    expect(parser._cleanData("", 'text')).toBe('');
    expect(parser._cleanData(null, 'text')).toBe('');
  });
});

describe('parser _getHeader', () => {
  it('should return an empty array if a empty sheet is provided', () => {
    expect(parser._getHeader([])).toEqual([]);
  });

  it('should return the header line', () => {
    const sheetMock = [
      ['anything11', 'anything21'],
      ['anything12', 'anything22'],
      ['cpf', 'nome', '', ''],
      ['', '', 'col1', 'col2'],
      ['anything13', 'anything23'],
    ];
    expect(parser._getHeader(sheetMock)).toEqual(['cpf', 'nome', 'col1', 'col2']);
  });

  it('should remove the columns in the header line tha are not part of the header', () => {
    const sheetMock = [
      ['anything11', 'anything21'],
      ['anything12', 'anything22'],
      ['cpf', 'nome', '', ''],
      ['', '', 'col1', 'col2', '', 'col3', 'col4'],
      ['anything13', 'anything23'],
    ];
    expect(parser._getHeader(sheetMock)).toEqual(['cpf', 'nome', 'col1', 'col2']);
  });
});

describe('parser _getOutraAndDetalheColumns', () => {
  it('return an empty array if the provided sheet is empty', () => {
    expect(parser._getOutraAndDetalheColumns([], '')).toEqual([]);
  });

  it('should return an model sheet model containing 1 outra column and 1 detalhe column', () => {
    const sheetMock = [
      ['anything11', 'anything21'],
      ['anything12', 'anything22'],
      ['cpf', 'nome', '', ''],
      ['', '', 'col1', 'col2', 'col3', 'col4'],
      ['anything13', 'anything23'],
    ];
    const outraAndDetalhe = parser._getOutraAndDetalheColumns(sheetMock, '', 4);
    const expectedRes = [
      { fieldName: `_outra1`, type: 'number' },
      { fieldName: `_detalhe1`, type: 'text' }
    ];
    expect(outraAndDetalhe).toEqual(expectedRes);
  });

  it('should return an model sheet model containing 2 outra column and 2 detalhe column', () => {
    const sheetMock = [
      ['anything11', 'anything21'],
      ['anything12', 'anything22'],
      ['cpf', 'nome', '', ''],
      ['', '', 'col1', 'col2', 'col3', 'col4', 'col5', 'col6'],
      ['anything13', 'anything23'],
    ];
    const outraAndDetalhe = parser._getOutraAndDetalheColumns(sheetMock, '', 4);
    const expectedRes = [
      { fieldName: `_outra1`, type: 'number' },
      { fieldName: `_detalhe1`, type: 'text' },
      { fieldName: `_outra2`, type: 'number' },
      { fieldName: `_detalhe2`, type: 'text' }
    ];
    expect(outraAndDetalhe).toEqual(expectedRes);
  });
});

describe('parser _joinOutraColumns', () => {
  it('should return 0 if an empty object is passed', () => {
    expect(parser._joinOutraColumns({})).toEqual(0);
  });

  it('should sum the value in each key that contains "_outra" in the passed object', () => {
    const sheetLineObj1 = {
      a: 1,
      b: 2,
      anything_outra: 3,
      c: 4
    };
    expect(parser._joinOutraColumns(sheetLineObj1)).toEqual(3);

    const sheetLineObj2 = {
      a: 1,
      b: 2,
      anything_outra1: 3,
      c: 4,
      anything_outra2: 5
    };
    expect(parser._joinOutraColumns(sheetLineObj2)).toEqual(8);
  });
});

describe('paser _joinDetalhesColumns', () => {
  it('should return empty string if an empty object is passed', () => {
    expect(parser._joinDetalheColumns({})).toEqual('');
  });

  it('should concatenate the value in each key that contains "_detalhe" in the passed object using " | " as separator', () => {
    const sheetLineObj1 = {
      a: "a",
      b: "b",
      anything_detalhe: "c",
      c: "d"
    };
    expect(parser._joinDetalheColumns(sheetLineObj1)).toEqual('c');

    const sheetLineObj2 = {
      a: 'a',
      b: 'b',
      anything_detalhe1: 'd',
      c: 'e',
      anything_detalhe2: 'f'
    };
    expect(parser._joinDetalheColumns(sheetLineObj2)).toEqual('d | f');
  });
});

describe('parser _filterOutraAndDetalheColumns', () => {
  it('should return an empty object if the passed object is empty', () => {
    expect(parser._filterOutraAndDetalheColumns({})).toEqual({});
  });

  it('should return an object without any properties that contains "_outra" or "_detalhe"', () => {
    const sheetLineObj1 = {
      a: 'something1',
      pre_outra1_pos: 'anything1',
      pre_detalhe1_pos: 'anything2',
      pre_outra2_pos: 'anything3',
      pre_detalhe2_pos: 'anything4',
      b: 'something2',
    };

    expect(parser._filterOutraAndDetalheColumns(sheetLineObj1)).toEqual({ a: 'something1', b: 'something2' });
  });
});

describe('parser _getIndenizacoesData', () => {
  const testIndenizacoesData = async (spreadsheetPath, expectedData) => {
    const spreadsheetBuffer = await getSpreadsheet(spreadsheetPath);
    const spreadsheet = convertSpreadsheetToJson(spreadsheetBuffer);
    expect(parser._getIndenizacoesData(spreadsheet)).toEqual(expectedData);
  };

  const regularIndenizacoesData = [
    { cpf: "xxx.xxx.xxx-xx", nome: "Nome1", auxilio_alimentacao: 11, auxilio_pre_escolar: 21, auxilio_saude: 31, auxilio_natalidade: 41, auxilio_moradia: 51, ajuda_de_custo: 61, indenizacoes_outras: 0, indenizacoes_detalhes: '', total_indenizacoes: 216 },
    { cpf: "xxx.xxx.xxx-xx", nome: "Nome2", auxilio_alimentacao: 12, auxilio_pre_escolar: 22, auxilio_saude: 32, auxilio_natalidade: 42, auxilio_moradia: 52, ajuda_de_custo: 62, indenizacoes_outras: 0, indenizacoes_detalhes: 'a | b | c', total_indenizacoes: 222 },
    { cpf: "xxx.xxx.xxx-xx", nome: "Nome3", auxilio_alimentacao: 13, auxilio_pre_escolar: 23, auxilio_saude: 33, auxilio_natalidade: 43, auxilio_moradia: 53, ajuda_de_custo: 63, indenizacoes_outras: 6, indenizacoes_detalhes: 'ab | cd | ef', total_indenizacoes: 234 },
    { cpf: "xxx.xxx.xxx-xx", nome: "Nome4", auxilio_alimentacao: 14, auxilio_pre_escolar: 24, auxilio_saude: 34, auxilio_natalidade: 44, auxilio_moradia: 54, ajuda_de_custo: 64, indenizacoes_outras: 3.6, indenizacoes_detalhes: 'detalhe one | detalhe two | detalhe three', total_indenizacoes: 237.6 }
  ];

  it('should throw an error when indenizacoes sheet is no found', async () => {
    const spreadsheetBuffer = await getSpreadsheet(MISSING_INDENIZACOES_SHEET_SPREADSHEET_PATH);
    const spreadsheet = convertSpreadsheetToJson(spreadsheetBuffer);
    try {
      parser._getIndenizacoesData(spreadsheet);
      fail('an error should be thrown');
    } catch (e) {
      const { message, code } = errorMessages.SHEET_NOT_FOUND('indenizações');
      expect(e).toEqual(new APIError(message, 404, code));
    }
  });

  it(`should get the data from the sheets with the header: 
      ["cpf","nome","Auxílio-alimentação (R$)","Auxílio Pré-escolar (R$)","Auxílio Saúde (R$)", "Auxílio Natalidade (R$)","Auxílio Moradia (R$)","Ajuda de Custo (R$)","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Total Indenizações"]`,
    async () => {
      await testIndenizacoesData(INDENIZACOES_HEADERS_1, regularIndenizacoesData);
    });

  it(`should get the data from the sheets with the header: 
    ["cpf","nome","Auxílio-alimentação (R$)","Auxílio Pré-escolar (R$)","Auxílio Saúde (R$)","Auxílio Natalidade (R$)","Auxílio Moradia (R$)","Ajuda de Custo (R$)","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Total Indenizações"],`,
    async () => {
      const expectedData = [
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome1", auxilio_alimentacao: 11, auxilio_pre_escolar: 21, auxilio_saude: 31, auxilio_natalidade: 41, auxilio_moradia: 51, ajuda_de_custo: 61, indenizacoes_outras: 0, indenizacoes_detalhes: '', total_indenizacoes: 216 },
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome2", auxilio_alimentacao: 12, auxilio_pre_escolar: 22, auxilio_saude: 32, auxilio_natalidade: 42, auxilio_moradia: 52, ajuda_de_custo: 62, indenizacoes_outras: 0, indenizacoes_detalhes: 'a | b | c | d', total_indenizacoes: 222 },
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome3", auxilio_alimentacao: 13, auxilio_pre_escolar: 23, auxilio_saude: 33, auxilio_natalidade: 43, auxilio_moradia: 53, ajuda_de_custo: 63, indenizacoes_outras: 10, indenizacoes_detalhes: 'ab | cd | ef | gh', total_indenizacoes: 238 },
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome4", auxilio_alimentacao: 14, auxilio_pre_escolar: 24, auxilio_saude: 34, auxilio_natalidade: 44, auxilio_moradia: 54, ajuda_de_custo: 64, indenizacoes_outras: 5.3, indenizacoes_detalhes: 'detalhe one | detalhe two | detalhe three | detalhe four', total_indenizacoes: 239.3 }
      ];
      await testIndenizacoesData(INDENIZACOES_HEADERS_2, expectedData);
    });

  it(`should get the data from the sheets with the header: 
  ["cpf","nome","Auxílio Alimentação (R$)","Auxílio Pré-escolar (R$)","Auxílio Saúde (R$)","Auxílio Natalidade (R$)","Auxílio Moradia (R$)","Ajuda de Custo (R$)","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Total Indenizações"]`,
    async () => {
      await testIndenizacoesData(INDENIZACOES_HEADERS_3, regularIndenizacoesData);
    });

  it(`should get the data from the sheets with the header: 
  ["cpf","nome","Auxílio-alimentação (R$)","Auxílio Pré-escolar (R$)","Auxílio Saúde (R$)","Auxílio Natalidade (R$)","Auxílio Moradia (R$)","Ajuda de Custo (R$)","Outra (R$)","Detalhe","Outra (R$)","Detalhe  (ABONO PECUNIÁRIO)","Outra (R$)","Detalhe","Total Indenizações"]`,
    async () => {
      await testIndenizacoesData(INDENIZACOES_HEADERS_4, regularIndenizacoesData);
    });

  it(`should get the data from the sheets with the header: 
  ["cpf","nome","Auxílio-alimentação (R$)","Auxílio Pré-escolar (R$)","Auxílio Saúde (R$)","Auxílio Natalidade (R$)","Auxílio Moradia (R$)","Ajuda de Custo (R$)","Outra 1 (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Total Indenizações"],`,
    async () => {
      await testIndenizacoesData(INDENIZACOES_HEADERS_5, regularIndenizacoesData);
    });

  it(`should get the data from the sheets with the header: 
  ["cpf","nome","Auxílio-alimentação (R$)","Auxílio Pré-escolar (R$)","Auxílio Saúde (R$)","Auxílio Natalidade (R$)","Auxílio Moradia (R$)","Ajuda de Custo (R$)","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Total Indenizações"]`,
    async () => {
      const expectedData = [
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome1", auxilio_alimentacao: 11, auxilio_pre_escolar: 21, auxilio_saude: 31, auxilio_natalidade: 41, auxilio_moradia: 51, ajuda_de_custo: 61, indenizacoes_outras: 0, indenizacoes_detalhes: '', total_indenizacoes: 216 },
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome2", auxilio_alimentacao: 12, auxilio_pre_escolar: 22, auxilio_saude: 32, auxilio_natalidade: 42, auxilio_moradia: 52, ajuda_de_custo: 62, indenizacoes_outras: 0, indenizacoes_detalhes: 'a | b | c | d | e | f | g | h | i', total_indenizacoes: 222 },
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome3", auxilio_alimentacao: 13, auxilio_pre_escolar: 23, auxilio_saude: 33, auxilio_natalidade: 43, auxilio_moradia: 53, ajuda_de_custo: 63, indenizacoes_outras: 45, indenizacoes_detalhes: 'ab | cd | ef | gh | ij | kl | mn | op | qr', total_indenizacoes: 273 },
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome4", auxilio_alimentacao: 14, auxilio_pre_escolar: 24, auxilio_saude: 34, auxilio_natalidade: 44, auxilio_moradia: 54, ajuda_de_custo: 64, indenizacoes_outras: 10.3, indenizacoes_detalhes: 'detalhe one | detalhe two | detalhe three | detalhe four | detalhe five | detalhe six | detalhe seven | detalhe eight | detalhe nine', total_indenizacoes: 244.3 }
      ];
      await testIndenizacoesData(INDENIZACOES_HEADERS_6, expectedData);
    });

  it(`should get the data from the sheets with the header: 
  ["cpf","nome","Auxílio-alimentação (R$)","Auxílio Pré-escolar (R$)","Auxílio Saúde (R$)","Auxílio Natalidade (R$)","Auxílio Moradia (R$)","Ajuda de Custo (R$)","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Total Indenizações"],`,
    async () => {
      const expectedData = [
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome1", auxilio_alimentacao: 11, auxilio_pre_escolar: 21, auxilio_saude: 31, auxilio_natalidade: 41, auxilio_moradia: 51, ajuda_de_custo: 61, indenizacoes_outras: 0, indenizacoes_detalhes: '', total_indenizacoes: 216 },
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome2", auxilio_alimentacao: 12, auxilio_pre_escolar: 22, auxilio_saude: 32, auxilio_natalidade: 42, auxilio_moradia: 52, ajuda_de_custo: 62, indenizacoes_outras: 0, indenizacoes_detalhes: 'a | b | c | d | e | f | g', total_indenizacoes: 222 },
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome3", auxilio_alimentacao: 13, auxilio_pre_escolar: 23, auxilio_saude: 33, auxilio_natalidade: 43, auxilio_moradia: 53, ajuda_de_custo: 63, indenizacoes_outras: 28, indenizacoes_detalhes: 'ab | cd | ef | gh | ij | kl | mn', total_indenizacoes: 256 },
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome4", auxilio_alimentacao: 14, auxilio_pre_escolar: 24, auxilio_saude: 34, auxilio_natalidade: 44, auxilio_moradia: 54, ajuda_de_custo: 64, indenizacoes_outras: 8.3, indenizacoes_detalhes: 'detalhe one | detalhe two | detalhe three | detalhe four | detalhe five | detalhe six | detalhe seven', total_indenizacoes: 242.3 }
      ];
      await testIndenizacoesData(INDENIZACOES_HEADERS_7, expectedData);
    });

  it(`should get the data from the sheets with the header: 
  ["cpf","nome","Auxílio-alimentação (R$)","Auxílio Pré-escolar (R$)","Auxílio Saúde (R$)","Auxílio Natalidade (R$)","Auxílio Moradia (R$)","Ajuda de Custo (R$)","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Total Indenizações"],`,
    async () => {
      const expectedData = [
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome1", auxilio_alimentacao: 11, auxilio_pre_escolar: 21, auxilio_saude: 31, auxilio_natalidade: 41, auxilio_moradia: 51, ajuda_de_custo: 61, indenizacoes_outras: 0, indenizacoes_detalhes: '', total_indenizacoes: 216 },
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome2", auxilio_alimentacao: 12, auxilio_pre_escolar: 22, auxilio_saude: 32, auxilio_natalidade: 42, auxilio_moradia: 52, ajuda_de_custo: 62, indenizacoes_outras: 0, indenizacoes_detalhes: 'a | b | c | d | e | f', total_indenizacoes: 222 },
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome3", auxilio_alimentacao: 13, auxilio_pre_escolar: 23, auxilio_saude: 33, auxilio_natalidade: 43, auxilio_moradia: 53, ajuda_de_custo: 63, indenizacoes_outras: 21, indenizacoes_detalhes: 'ab | cd | ef | gh | ij | kl', total_indenizacoes: 249 },
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome4", auxilio_alimentacao: 14, auxilio_pre_escolar: 24, auxilio_saude: 34, auxilio_natalidade: 44, auxilio_moradia: 54, ajuda_de_custo: 64, indenizacoes_outras: 7.3, indenizacoes_detalhes: 'detalhe one | detalhe two | detalhe three | detalhe four | detalhe five | detalhe six', total_indenizacoes: 241.3 }
      ];
      await testIndenizacoesData(INDENIZACOES_HEADERS_8, expectedData);
    });

  it(`should get the data from the sheets with the header: 
  ["cpf","nome","Auxílio-alimentação","Auxílio Pré-escolar","Auxílio Saúde","Auxílio Natalidade","Auxílio Moradia","Ajuda de Custo","Total Indenizações"],`,
    async () => {
      const expectedData = [
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome1", auxilio_alimentacao: 11, auxilio_pre_escolar: 21, auxilio_saude: 31, auxilio_natalidade: 41, auxilio_moradia: 51, ajuda_de_custo: 61, indenizacoes_outras: 0, indenizacoes_detalhes: '', total_indenizacoes: 216 },
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome2", auxilio_alimentacao: 12, auxilio_pre_escolar: 22, auxilio_saude: 32, auxilio_natalidade: 42, auxilio_moradia: 52, ajuda_de_custo: 62, indenizacoes_outras: 0, indenizacoes_detalhes: '', total_indenizacoes: 222 },
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome3", auxilio_alimentacao: 13, auxilio_pre_escolar: 23, auxilio_saude: 33, auxilio_natalidade: 43, auxilio_moradia: 53, ajuda_de_custo: 63, indenizacoes_outras: 0, indenizacoes_detalhes: '', total_indenizacoes: 228 },
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome4", auxilio_alimentacao: 14, auxilio_pre_escolar: 24, auxilio_saude: 34, auxilio_natalidade: 44, auxilio_moradia: 54, ajuda_de_custo: 64, indenizacoes_outras: 0, indenizacoes_detalhes: '', total_indenizacoes: 234 }
      ];
      await testIndenizacoesData(INDENIZACOES_HEADERS_9, expectedData);
    });

  it(`should get the data from the sheets with the header: 
  ["cpf","nome","Auxílio-alimentação (R$)","Auxílio Pré-escolar (R$)","Auxílio Saúde (R$) 1911","Auxílio Natalidade (R$)","Auxílio Moradia (R$)","Ajuda de Custo (R$)","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Total Indenizações"]`,
    async () => {
      await testIndenizacoesData(INDENIZACOES_HEADERS_10, regularIndenizacoesData);
    });

  it(`should get the data from the sheets with the header: 
  ["cpf","nome","Auxílio-alimentação (R$)","Auxílio Pré-escolar (R$)","Auxílio Saúde (R$)","Auxílio Natalidade (R$)","Auxílio Moradia (R$)","Ajuda de Custo (R$)","Outra (R$)","Bolsa Pós-Graduação (R$)","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Total Indenizações"]`,
    async () => {
      await testIndenizacoesData(INDENIZACOES_HEADERS_11, regularIndenizacoesData);
    });


  it(`should get the data from the sheets with the header: 
  ["cpf","nome","Auxílioalimentação (R$)", "Auxílio Préescolar (R$)", "Auxílio Saúde (R$)","Auxílio Natalidade (R$)","Auxílio Moradia (R$)","Ajuda de Custo (R$)","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Total Indenizações"]`,
    async () => {
      await testIndenizacoesData(INDENIZACOES_HEADERS_12, regularIndenizacoesData);
    });

  it(`should get the data from the sheets with the header: 
  ["cpf","nome","Auxílio-alimentação (R$)","Auxílio Pré-escolar (R$)","Auxílio Saúde (R$)","Auxílio Natalidade (R$)","Auxílio Moradia (R$)","Ajuda de Custo (R$)","Bolsa Pós-Graduação (R$)","Detalhe","Outra (R$)","Detalhe","Outra (R$)","Detalhe","Total Indenizações"],`,
    async () => {
      await testIndenizacoesData(INDENIZACOES_HEADERS_13, regularIndenizacoesData);
    });

  it('should throw an APIError when the header is: [cpf,nome]', async () => {
    try {
      await testIndenizacoesData(INDENIZACOES_HEADERS_14, {});
      fail('an error should have been thrown');
    } catch (e) {
      const { message, code } = errorMessages.HEADER_SIZE_ERROR(9, 2, 'indenizacoes');
      expect(e.message).toEqual(message);
      expect(e.errorCode).toEqual(code);
      expect(e.status).toEqual(httpStatus.BAD_REQUEST);
    }
  });
});

describe('parser _getDireitosEventuaisData', () => {
  const testDireitosEventuaisData = async (spreadsheetPath, expectedData) => {
    const spreadsheetBuffer = await getSpreadsheet(spreadsheetPath);
    const spreadsheet = convertSpreadsheetToJson(spreadsheetBuffer);
    expect(parser._getDireitosEventuaisData(spreadsheet)).toEqual(expectedData);
  };

  it(`should get the data from the sheets with the header:
  [cpf,nome,Abono constitucional de 1/3 de férias (R$),Indenização de férias (R$),Antecipação de férias (R$),Gratificação natalina (R$),Antecipação de gratificação natalina (R$),Substituição (R$),Gratificação por exercício cumulativo (R$),Gratificação por encargo Curso/Concurso (R$),Pagamentos retroativos (R$),JETON (R$),Outra (R$),Detalhe,Outra (R$),Detalhe,Total de Direitos Eventuais]"`,
    async () => {
      const expectedData = [
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome1", abono_contitucional_de_1_3_de_ferias: 11, indenizacao_de_ferias: 21, antecipacao_de_ferias: 31, gratificacao_natalina: 41, antecipacao_de_gratificacao_natalina: 51, substituicao: 61, gratificacao_por_exercicio_cumulativo: 71, gratificacao_por_encargo_curso_concurso: 81, pagamento_em_retroativos: 91, jeton: 11, direitos_eventuais_outras: 0, direitos_eventuais_detalhes: '', total_de_direitos_eventuais: 470 },
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome2", abono_contitucional_de_1_3_de_ferias: 12, indenizacao_de_ferias: 22, antecipacao_de_ferias: 32, gratificacao_natalina: 42, antecipacao_de_gratificacao_natalina: 52, substituicao: 62, gratificacao_por_exercicio_cumulativo: 72, gratificacao_por_encargo_curso_concurso: 82, pagamento_em_retroativos: 92, jeton: 12, direitos_eventuais_outras: 0, direitos_eventuais_detalhes: 'a | b', total_de_direitos_eventuais: 480 },
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome3", abono_contitucional_de_1_3_de_ferias: 13, indenizacao_de_ferias: 23, antecipacao_de_ferias: 33, gratificacao_natalina: 43, antecipacao_de_gratificacao_natalina: 53, substituicao: 63, gratificacao_por_exercicio_cumulativo: 73, gratificacao_por_encargo_curso_concurso: 83, pagamento_em_retroativos: 93, jeton: 13, direitos_eventuais_outras: 3, direitos_eventuais_detalhes: 'ab | cd', total_de_direitos_eventuais: 493 },
        { cpf: "xxx.xxx.xxx-xx", nome: "Nome4", abono_contitucional_de_1_3_de_ferias: 14, indenizacao_de_ferias: 24, antecipacao_de_ferias: 34, gratificacao_natalina: 44, antecipacao_de_gratificacao_natalina: 54, substituicao: 64, gratificacao_por_exercicio_cumulativo: 74, gratificacao_por_encargo_curso_concurso: 84, pagamento_em_retroativos: 94, jeton: 14, direitos_eventuais_outras: 4.2, direitos_eventuais_detalhes: 'detalhe one | detalhe two', total_de_direitos_eventuais: 504.2 },
      ];
      await testDireitosEventuaisData(DIREITOS_EVENTUAIS_HEADER_1, expectedData);
    });

  it('should throw an error when direitos eventuais sheet is no found', async () => {
    const spreadsheetBuffer = await getSpreadsheet(MISSING_DIREITOS_EVENTUAIS_SHEET_SPREADSHEET_PATH);
    const spreadsheet = convertSpreadsheetToJson(spreadsheetBuffer);
    try {
      parser._getDireitosEventuaisData(spreadsheet);
      fail('an error should be thrown');
    } catch (e) {
      const { message, code } = errorMessages.SHEET_NOT_FOUND('direitos eventuais');
      expect(e).toEqual(new APIError(message, 404, code));
    }
  });
});

describe('parser _getDadosCadastraisData', () => {
  const testDadosCadastraisData = async (spreadsheetPath, expectedData) => {
    const spreadsheetBuffer = await getSpreadsheet(spreadsheetPath);
    const spreadsheet = convertSpreadsheetToJson(spreadsheetBuffer);
    expect(parser._getDadosCadastraisData(spreadsheet)).toEqual(expectedData);
  };

  it(`should get the data from the dados cadastrais sheet`, async () => {
    const expectedData = [
      { cpf: 'xxx.xxx.xxx-xx', nome: 'Nome1', matricula: 1, lotacao_de_origem: 'Juiz Eleitoral', orgao_de_origem: 'TJRN', cargo_de_origem: 'Juiz de Direito' },
      { cpf: 'xxx.xxx.xxx-xx', nome: 'Nome2', matricula: 2, lotacao_de_origem: 'Juiz Eleitoral', orgao_de_origem: 'TJRN', cargo_de_origem: 'Juiz de Direito' },
      { cpf: 'xxx.xxx.xxx-xx', nome: 'Nome3', matricula: 3, lotacao_de_origem: 'Juiz Eleitoral', orgao_de_origem: 'TJRN', cargo_de_origem: 'Juiz de Direito' },
      { cpf: 'xxx.xxx.xxx-xx', nome: 'nome4', matricula: 4, lotacao_de_origem: 'Juiz Eleitoral', orgao_de_origem: 'TJRN', cargo_de_origem: 'Juiz de Direito' },
    ];
    await testDadosCadastraisData(SIMPLE_DATA_SPREADSHEET_PATH, expectedData);
  });
});

describe('parser _convertToNameHashTable', () => {
  it('should convert an sheet into a hash table with the name as key for each line', () => {
    const sheetMock = [
      { nome: 'nome1', a: 'a' },
      { nome: 'nome2', a: 'b' },
    ];
    const expectedResult = {
      nome1: { nome: 'nome1', a: 'a' },
      nome2: { nome: 'nome2', a: 'b' },
    };

    expect(parser._convertToNameHashTable(sheetMock)).toEqual(expectedResult);
  });
});

describe('parser _getOrgao', () => {
  const orgaoLabel = "Órgão";
  it('should throw an error if no orgao id found', () => {
    const sheetMock = [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ];
    try {
      parser._getOrgao(sheetMock);
      fail('an error should have been thrown');
    } catch (e) {
      const { message, code } = errorMessages.SPREASHEET_DATA_NOT_FOUND(orgaoLabel);
      expect(e).toEqual(new APIError(message, 404, code));
    }
  });
  it('should return the orgao', () => {
    const expectedOrgao = "Tribunal asdf";
    const sheetMock = [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
      [orgaoLabel, '', '', expectedOrgao, ''],
    ];
    expect(parser._getOrgao(sheetMock)).toEqual(expectedOrgao);
  })
});

describe('parser _getMesReferencia', () => {
  const mesReferenciaLabel = 'Mês/Ano de Referência';
  it('should throw an error if no mesReferencia id found', () => {
    const sheetMock = [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ];
    try {
      parser._getMesReferencia(sheetMock);
      fail('an error should have been thrown');
    } catch (e) {
      const { message, code } = errorMessages.SPREASHEET_DATA_NOT_FOUND(mesReferenciaLabel);
      expect(e).toEqual(new APIError(message, 404, code));
    }
  });

  it('should return the formated date when the sheet has an literal date MM/YY or MM/YYYY', () => {
    const expectedMonth = "2019-5";
    const sheetMockYY = [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
      [mesReferenciaLabel, '', '', '05/19', ''],
    ];
    const sheetMockYYYY = [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
      [mesReferenciaLabel, '', '', '05/2019', ''],
    ];
    expect(parser._getMesReferencia(sheetMockYY)).toEqual(expectedMonth);
    expect(parser._getMesReferencia(sheetMockYYYY)).toEqual(expectedMonth);
  });

  it('should return the formated date when the sheet has an excel date format', () => {
    const expectedMonth = "2018-10";
    const sheetMock = [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
      [mesReferenciaLabel, '', '', 43385, ''],
    ];
    expect(parser._getMesReferencia(sheetMock)).toEqual(expectedMonth);
  });

  it('should return the formated date when the sheet has an Date object', () => {
    const expectedMonth = "2018-10";
    const sheetMock = [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
      [mesReferenciaLabel, '', '', new Date('2018-10-02'), ''],
    ];
    expect(parser._getMesReferencia(sheetMock)).toEqual(expectedMonth);
  });
});

describe('parser parse', () => {
  it('should parse a simple spreadsheet data', async () => {
    const spreadsheetBuffer = await getSpreadsheet(SIMPLE_DATA_SPREADSHEET_PATH);
    const spreadsheet = convertSpreadsheetToJson(spreadsheetBuffer);
    const expectedData = [
      { cpf: 'xxx.xxx.xxx-xx', nome: 'Nome1', cargo: 'Juiz Eleitoral', lotacao: 'CARTÓRIO ELEITORAL', subsidio: 11, direitos_pessoais: 63.5, indenizacoes: 459, direitos_eventuais: 792, total_de__rendimentos: 1325.5, previdencia_publica: 21, imposto_de_renda: 31, descontos_diversos: 41, retencao_por_teto_constitucional: 51, total_de_descontos: 61, rendimento_liquido: 1264.5, remuneracao_do_orgao_de_origem: 71, diarias: 81, abono_de_permanencia: 11.5, subsidio_outras: 52, subsidio_detalhes: 'asdf1 | qwer1', total_de_direitos_pessoais: 63.5, auxilio_alimentacao: 11, auxilio_pre_escolar: 21, auxilio_saude: 31, auxilio_natalidade: 41, auxilio_moradia: 51, ajuda_de_custo: 61, indenizacoes_outras: 243, indenizacoes_detalhes: 'poiu1 | mnbv1 | zxcv1', total_indenizacoes: 459, abono_contitucional_de_1_3_de_ferias: 11, indenizacao_de_ferias: 21, antecipacao_de_ferias: 31, gratificacao_natalina: 41, antecipacao_de_gratificacao_natalina: 51, substituicao: 61, gratificacao_por_exercicio_cumulativo: 71, gratificacao_por_encargo_curso_concurso: 81, pagamento_em_retroativos: 91, jeton: 101, direitos_eventuais_outras: 232, direitos_eventuais_detalhes: 'Gratificação Eleitoral | fdsa1', total_de_direitos_eventuais: 792, matricula: 1, lotacao_de_origem: 'Juiz Eleitoral', orgao_de_origem: 'TJRN', cargo_de_origem: 'Juiz de Direito', mes_ano_referencia: '2018-7', orgao: 'Tribunal Regional Eleitoral do Rio Grande do Norte' },
      { cpf: 'xxx.xxx.xxx-xx', nome: 'Nome2', cargo: 'Juiz Eleitoral', lotacao: 'CARTÓRIO ELEITORAL', subsidio: 12, direitos_pessoais: 66, indenizacoes: 468, direitos_eventuais: 804, total_de__rendimentos: 1350, previdencia_publica: 22, imposto_de_renda: 32, descontos_diversos: 42, retencao_por_teto_constitucional: 52, total_de_descontos: 62, rendimento_liquido: 1288, remuneracao_do_orgao_de_origem: 72, diarias: 82, abono_de_permanencia: 12, subsidio_outras: 54, subsidio_detalhes: 'asdf2 | qwer2', total_de_direitos_pessoais: 66, auxilio_alimentacao: 12, auxilio_pre_escolar: 22, auxilio_saude: 32, auxilio_natalidade: 42, auxilio_moradia: 52, ajuda_de_custo: 62, indenizacoes_outras: 246, indenizacoes_detalhes: 'poiu2 | mnbv2 | zxcv2', total_indenizacoes: 468, abono_contitucional_de_1_3_de_ferias: 12, indenizacao_de_ferias: 22, antecipacao_de_ferias: 32, gratificacao_natalina: 42, antecipacao_de_gratificacao_natalina: 52, substituicao: 62, gratificacao_por_exercicio_cumulativo: 72, gratificacao_por_encargo_curso_concurso: 82, pagamento_em_retroativos: 92, jeton: 102, direitos_eventuais_outras: 234, direitos_eventuais_detalhes: 'Gratificação Eleitoral | fdsa2', total_de_direitos_eventuais: 804, matricula: 2, lotacao_de_origem: 'Juiz Eleitoral', orgao_de_origem: 'TJRN', cargo_de_origem: 'Juiz de Direito', mes_ano_referencia: '2018-7', orgao: 'Tribunal Regional Eleitoral do Rio Grande do Norte' },
      { cpf: 'xxx.xxx.xxx-xx', nome: 'Nome3', cargo: 'Juiz Eleitoral', lotacao: 'CARTÓRIO ELEITORAL', subsidio: 13, direitos_pessoais: 69, indenizacoes: 477, direitos_eventuais: 816, total_de__rendimentos: 1375, previdencia_publica: 23, imposto_de_renda: 33, descontos_diversos: 43, retencao_por_teto_constitucional: 53, total_de_descontos: 63, rendimento_liquido: 1312, remuneracao_do_orgao_de_origem: 73, diarias: 83, abono_de_permanencia: 13, subsidio_outras: 56, subsidio_detalhes: 'asdf3 | qwer3', total_de_direitos_pessoais: 69, auxilio_alimentacao: 13, auxilio_pre_escolar: 23, auxilio_saude: 33, auxilio_natalidade: 43, auxilio_moradia: 53, ajuda_de_custo: 63, indenizacoes_outras: 249, indenizacoes_detalhes: 'poiu3 | mnbv3 | zxcv3', total_indenizacoes: 477, abono_contitucional_de_1_3_de_ferias: 13, indenizacao_de_ferias: 23, antecipacao_de_ferias: 33, gratificacao_natalina: 43, antecipacao_de_gratificacao_natalina: 53, substituicao: 63, gratificacao_por_exercicio_cumulativo: 73, gratificacao_por_encargo_curso_concurso: 83, pagamento_em_retroativos: 93, jeton: 103, direitos_eventuais_outras: 236, direitos_eventuais_detalhes: 'Gratificação Eleitoral | fsa3', total_de_direitos_eventuais: 816, matricula: 3, lotacao_de_origem: 'Juiz Eleitoral', orgao_de_origem: 'TJRN', cargo_de_origem: 'Juiz de Direito', mes_ano_referencia: '2018-7', orgao: 'Tribunal Regional Eleitoral do Rio Grande do Norte' },
      { cpf: 'xxx.xxx.xxx-xx', nome: 'nome4', cargo: 'Juiz Eleitoral', lotacao: 'CARTÓRIO ELEITORAL', subsidio: 14, direitos_pessoais: 72, indenizacoes: 486, direitos_eventuais: 828, total_de__rendimentos: 1400, previdencia_publica: 24, imposto_de_renda: 34, descontos_diversos: 44, retencao_por_teto_constitucional: 54, total_de_descontos: 64, rendimento_liquido: 1336, remuneracao_do_orgao_de_origem: 74, diarias: 84, abono_de_permanencia: 14, subsidio_outras: 58, subsidio_detalhes: 'asdf4 | qwer4', total_de_direitos_pessoais: 72, auxilio_alimentacao: 14, auxilio_pre_escolar: 24, auxilio_saude: 34, auxilio_natalidade: 44, auxilio_moradia: 54, ajuda_de_custo: 64, indenizacoes_outras: 252, indenizacoes_detalhes: 'poiu4 | mnbv4 | zxcv4', total_indenizacoes: 486, abono_contitucional_de_1_3_de_ferias: 14, indenizacao_de_ferias: 24, antecipacao_de_ferias: 34, gratificacao_natalina: 44, antecipacao_de_gratificacao_natalina: 54, substituicao: 64, gratificacao_por_exercicio_cumulativo: 74, gratificacao_por_encargo_curso_concurso: 84, pagamento_em_retroativos: 94, jeton: 104, direitos_eventuais_outras: 238, direitos_eventuais_detalhes: 'Gratificação Eleitoral | fdsa4', total_de_direitos_eventuais: 828, matricula: 4, lotacao_de_origem: 'Juiz Eleitoral', orgao_de_origem: 'TJRN', cargo_de_origem: 'Juiz de Direito', mes_ano_referencia: '2018-7', orgao: 'Tribunal Regional Eleitoral do Rio Grande do Norte' },
    ];
    expect(parser.parse(spreadsheet)).toEqual(expectedData);
  });

  it('should parse a simple spreadsheet filling missing information in other sheets', async () => {
    const spreadsheetBuffer = await getSpreadsheet(MISSING_DATA_SPREADSHEET_PATH);
    const spreadsheet = convertSpreadsheetToJson(spreadsheetBuffer);
    const expectedData = [
      { cpf: 'xxx.xxx.xxx-xx', nome: 'Nome1', cargo: 0, lotacao: 'CARTÓRIO ELEITORAL', subsidio: 111, direitos_pessoais: 0, indenizacoes: 0, direitos_eventuais: 0, total_de__rendimentos: 111, previdencia_publica: 21, imposto_de_renda: 31, descontos_diversos: 41, retencao_por_teto_constitucional: 11, total_de_descontos: 61, rendimento_liquido: 50, remuneracao_do_orgao_de_origem: 71, diarias: 81, abono_de_permanencia: 0, subsidio_outras: 0, subsidio_detalhes: '', total_de_direitos_pessoais: 0, auxilio_alimentacao: 0, auxilio_pre_escolar: 0, auxilio_saude: 0, auxilio_natalidade: 0, auxilio_moradia: 0, ajuda_de_custo: 0, indenizacoes_outras: 0, indenizacoes_detalhes: '', total_indenizacoes: 0, abono_contitucional_de_1_3_de_ferias: 0, indenizacao_de_ferias: 0, antecipacao_de_ferias: 0, gratificacao_natalina: 0, antecipacao_de_gratificacao_natalina: 0, substituicao: 0, gratificacao_por_exercicio_cumulativo: 0, gratificacao_por_encargo_curso_concurso: 0, pagamento_em_retroativos: 0, jeton: 0, direitos_eventuais_outras: 0, direitos_eventuais_detalhes: '', total_de_direitos_eventuais: 0, matricula: 0, lotacao_de_origem: '', orgao_de_origem: '', cargo_de_origem: '', mes_ano_referencia: '2018-7', orgao: 'Tribunal Regional Eleitoral do Rio Grande do Norte' },
      { cpf: 'xxx.xxx.xxx-xx', nome: 'Nome2', cargo: 0, lotacao: 'CARTÓRIO ELEITORAL', subsidio: 112, direitos_pessoais: 0, indenizacoes: 0, direitos_eventuais: 0, total_de__rendimentos: 112, previdencia_publica: 22, imposto_de_renda: 32, descontos_diversos: 42, retencao_por_teto_constitucional: 52, total_de_descontos: 62, rendimento_liquido: 50, remuneracao_do_orgao_de_origem: 72, diarias: 82, abono_de_permanencia: 0, subsidio_outras: 0, subsidio_detalhes: '', total_de_direitos_pessoais: 0, auxilio_alimentacao: 0, auxilio_pre_escolar: 0, auxilio_saude: 0, auxilio_natalidade: 0, auxilio_moradia: 0, ajuda_de_custo: 0, indenizacoes_outras: 0, indenizacoes_detalhes: '', total_indenizacoes: 0, abono_contitucional_de_1_3_de_ferias: 0, indenizacao_de_ferias: 0, antecipacao_de_ferias: 0, gratificacao_natalina: 0, antecipacao_de_gratificacao_natalina: 0, substituicao: 0, gratificacao_por_exercicio_cumulativo: 0, gratificacao_por_encargo_curso_concurso: 0, pagamento_em_retroativos: 0, jeton: 0, direitos_eventuais_outras: 0, direitos_eventuais_detalhes: '', total_de_direitos_eventuais: 0, matricula: 0, lotacao_de_origem: '', orgao_de_origem: '', cargo_de_origem: '', mes_ano_referencia: '2018-7', orgao: 'Tribunal Regional Eleitoral do Rio Grande do Norte' },
      { cpf: 'xxx.xxx.xxx-xx', nome: 'Nome3', cargo: 0, lotacao: 'CARTÓRIO ELEITORAL', subsidio: 113, direitos_pessoais: 0, indenizacoes: 0, direitos_eventuais: 0, total_de__rendimentos: 113, previdencia_publica: 23, imposto_de_renda: 33, descontos_diversos: 43, retencao_por_teto_constitucional: 53, total_de_descontos: 63, rendimento_liquido: 50, remuneracao_do_orgao_de_origem: 73, diarias: 83, abono_de_permanencia: 0, subsidio_outras: 0, subsidio_detalhes: '', total_de_direitos_pessoais: 0, auxilio_alimentacao: 0, auxilio_pre_escolar: 0, auxilio_saude: 0, auxilio_natalidade: 0, auxilio_moradia: 0, ajuda_de_custo: 0, indenizacoes_outras: 0, indenizacoes_detalhes: '', total_indenizacoes: 0, abono_contitucional_de_1_3_de_ferias: 0, indenizacao_de_ferias: 0, antecipacao_de_ferias: 0, gratificacao_natalina: 0, antecipacao_de_gratificacao_natalina: 0, substituicao: 0, gratificacao_por_exercicio_cumulativo: 0, gratificacao_por_encargo_curso_concurso: 0, pagamento_em_retroativos: 0, jeton: 0, direitos_eventuais_outras: 0, direitos_eventuais_detalhes: '', total_de_direitos_eventuais: 0, matricula: 0, lotacao_de_origem: '', orgao_de_origem: '', cargo_de_origem: '', mes_ano_referencia: '2018-7', orgao: 'Tribunal Regional Eleitoral do Rio Grande do Norte' },
      { cpf: 'xxx.xxx.xxx-xx', nome: 'nome4', cargo: 0, lotacao: 'CARTÓRIO ELEITORAL', subsidio: 114, direitos_pessoais: 0, indenizacoes: 0, direitos_eventuais: 0, total_de__rendimentos: 114, previdencia_publica: 24, imposto_de_renda: 34, descontos_diversos: 44, retencao_por_teto_constitucional: 54, total_de_descontos: 64, rendimento_liquido: 50, remuneracao_do_orgao_de_origem: 74, diarias: 84, abono_de_permanencia: 0, subsidio_outras: 0, subsidio_detalhes: '', total_de_direitos_pessoais: 0, auxilio_alimentacao: 0, auxilio_pre_escolar: 0, auxilio_saude: 0, auxilio_natalidade: 0, auxilio_moradia: 0, ajuda_de_custo: 0, indenizacoes_outras: 0, indenizacoes_detalhes: '', total_indenizacoes: 0, abono_contitucional_de_1_3_de_ferias: 0, indenizacao_de_ferias: 0, antecipacao_de_ferias: 0, gratificacao_natalina: 0, antecipacao_de_gratificacao_natalina: 0, substituicao: 0, gratificacao_por_exercicio_cumulativo: 0, gratificacao_por_encargo_curso_concurso: 0, pagamento_em_retroativos: 0, jeton: 0, direitos_eventuais_outras: 0, direitos_eventuais_detalhes: '', total_de_direitos_eventuais: 0, matricula: 0, lotacao_de_origem: '', orgao_de_origem: '', cargo_de_origem: '', mes_ano_referencia: '2018-7', orgao: 'Tribunal Regional Eleitoral do Rio Grande do Norte' },
    ];
    expect(parser.parse(spreadsheet)).toEqual(expectedData);
  });
});

