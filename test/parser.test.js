const parser = require('../src/parser');

describe('paser parse', () => {
  it('shoul throw not implemented error', () => {
    try {
      parser.parse();
      fail('an error should have been thrown');
    } catch(e) {
      expect(e.message).toEqual('not implemented yet');
    }
  });
});

describe('parser _getHeaderLine ', () => {
  it('should return undefined if the sheet is empty', () => {
    const emptySheet1 = [],
          emptySheet2 = [[]],
          emptySheet3 = [[], [], []],
          emptySheet4 = [['','',''], []];
    
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
      expect(parser._getHeaderLine(sheet)).toBe(index+1);    
    });
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