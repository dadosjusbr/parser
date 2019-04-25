const parser = require('../src/parser');
const { getSpreadsheet, SIMPLE_DATA_SPREADSHEET_PATH } = require('./spreadsheets');
const { convertSpreadsheetToJson } = require('../src/xlsx_service');

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
  it('should collect the subsidio data from the spreadsheet', async () => {
    const spreadsheetBuffer = await getSpreadsheet(SIMPLE_DATA_SPREADSHEET_PATH);
    const spreadsheet = convertSpreadsheetToJson(spreadsheetBuffer);
    const expectedContrachequeData = [
      { abono_de_permanencia: 11.5, cpf: "xxx.xxx.xxx-xx", nome: "Nome1", subsidio_detalhes: "asdf1 | qwer1", subsidio_outras: 52, total_de_direitos_pessoais: 63.5 },
      { abono_de_permanencia: 12, cpf: "xxx.xxx.xxx-xx", nome: "Nome2", subsidio_detalhes: "asdf2 | qwer2", subsidio_outras: 54, total_de_direitos_pessoais: 66 },
      { abono_de_permanencia: 13, cpf: "xxx.xxx.xxx-xx", nome: "Nome3", subsidio_detalhes: "asdf3 | qwer3", subsidio_outras: 56, total_de_direitos_pessoais: 69 },
      { abono_de_permanencia: 14, cpf: "xxx.xxx.xxx-xx", nome: "nome4", subsidio_detalhes: "asdf4 | qwer4", subsidio_outras: 58, total_de_direitos_pessoais: 72 }
    ];

    expect(parser._getSubsidioData(spreadsheet)).toEqual(expectedContrachequeData);
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
    const outraAndDetalhe = parser._getOutraAndDetalheColumns(sheetMock, '');
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
    const outraAndDetalhe = parser._getOutraAndDetalheColumns(sheetMock, '');
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