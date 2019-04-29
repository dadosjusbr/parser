const parser = require('../src/parser');
const {
  getSpreadsheet, SIMPLE_DATA_SPREADSHEET_PATH,

  SUBSIDIO_HEADERS_1, SUBSIDIO_HEADERS_2, SUBSIDIO_HEADERS_3, SUBSIDIO_HEADERS_4,
  SUBSIDIO_HEADERS_5, SUBSIDIO_HEADERS_6, SUBSIDIO_HEADERS_7, SUBSIDIO_HEADERS_8,
  SUBSIDIO_HEADERS_9, SUBSIDIO_HEADERS_10, SUBSIDIO_HEADERS_11, SUBSIDIO_HEADERS_12,

  INDENIZACOES_HEADERS_1, INDENIZACOES_HEADERS_2, INDENIZACOES_HEADERS_3, INDENIZACOES_HEADERS_4,
  INDENIZACOES_HEADERS_5, INDENIZACOES_HEADERS_6, INDENIZACOES_HEADERS_7, INDENIZACOES_HEADERS_8,
  INDENIZACOES_HEADERS_9, INDENIZACOES_HEADERS_10, INDENIZACOES_HEADERS_11, INDENIZACOES_HEADERS_12,
  INDENIZACOES_HEADERS_13, INDENIZACOES_HEADERS_14
} = require('./spreadsheets');
const { convertSpreadsheetToJson } = require('../src/xlsx_service');
const errorMessages = require('../src/error_messages');
const httpStatus = require('http-status');

describe('paser parse', () => {
  it('shoul throw not implemented error', () => {
    try {
      parser.parse();
      fail('an error should have been thrown');
    } catch (e) {
      expect(e.message).toEqual('not implemented yet');
    }
  });
});

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
      { cargo: "Juiz Eleitoral", cpf: "xxx.xxx.xxx-xx", descontos_diversos: 41, diarias: 81, direitos_eventuais: 792, direitos_pessoias: 63.5, imposto_de_renda: 31, indenizacoes: 459, lotacao: "CARTÓRIO ELEITORAL", nome: "Nome1", previdencia_publica: 21, remuneracao_do_orgao_de_origem: 71, rendimento_liquido: 1264.5, retencao_por_teto_constitucional: 51, subsidio: 11, total_de__rendimentos: 1325.5, total_de_descontos: 61 },
      { cargo: "Juiz Eleitoral", cpf: "xxx.xxx.xxx-xx", descontos_diversos: 42, diarias: 82, direitos_eventuais: 804, direitos_pessoias: 66, imposto_de_renda: 32, indenizacoes: 468, lotacao: "CARTÓRIO ELEITORAL", nome: "Nome2", previdencia_publica: 22, remuneracao_do_orgao_de_origem: 72, rendimento_liquido: 1288, retencao_por_teto_constitucional: 52, subsidio: 12, total_de__rendimentos: 1350, total_de_descontos: 62 },
      { cargo: "Juiz Eleitoral", cpf: "xxx.xxx.xxx-xx", descontos_diversos: 43, diarias: 83, direitos_eventuais: 816, direitos_pessoias: 69, imposto_de_renda: 33, indenizacoes: 477, lotacao: "CARTÓRIO ELEITORAL", nome: "Nome3", previdencia_publica: 23, remuneracao_do_orgao_de_origem: 73, rendimento_liquido: 1312, retencao_por_teto_constitucional: 53, subsidio: 13, total_de__rendimentos: 1375, total_de_descontos: 63 },
      { cargo: "Juiz Eleitoral", cpf: "xxx.xxx.xxx-xx", descontos_diversos: 44, diarias: 84, direitos_eventuais: 828, direitos_pessoias: 72, imposto_de_renda: 34, indenizacoes: 486, lotacao: "CARTÓRIO ELEITORAL", nome: "nome4", previdencia_publica: 24, remuneracao_do_orgao_de_origem: 74, rendimento_liquido: 1336, retencao_por_teto_constitucional: 54, subsidio: 14, total_de__rendimentos: 1400, total_de_descontos: 64 }
    ];

    expect(parser._getContrachequeData(spreadsheet)).toEqual(expectedContrachequeData);
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
      const {message, code} = errorMessages.HEADER_SIZE_ERROR(9, 2, 'indenizacoes');
      expect(e.message).toEqual(message);
      expect(e.errorCode).toEqual(code);
      expect(e.status).toEqual(httpStatus.BAD_REQUEST);
    }
  });
});