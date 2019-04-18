const { containsSubstring } = require('./string_utils');

/**
 * Keywords contained on each name or title.  
 */
const CONTRACHEQUE_KEYWORD = 'contracheque',
  SUBSIDIO_KEYWORD = 'pessoais',
  INDENIZACOES_KEYWORD = 'indenizacoes',
  DIREITOS_EVENTUAIS_KEYWORD = 'eventuais',
  DADOS_CADASTRAIS_KEYWORD = 'dados cadastrais';

/**
 * Returns the line on the sheet where the header is located.
 * 
 * @param {Array} sheet 
 */
const _getHeaderLine = sheet => {
  const headerKeywords = ['cpf', 'nome'];
  const foundHeaderLine = sheet.reduce((headerLine, line, lineNumber) => {
    const isHeader = line.length >= headerKeywords.length && headerKeywords.every((key, index) =>
      !!line[index] && containsSubstring(line[index], key));
    return isHeader ? lineNumber + 1 : headerLine;
  }, -1);
  return foundHeaderLine !== -1 ? foundHeaderLine : undefined;
};

/**
 * Find a specific sheet on a spreadsheet based on a keyword.
 * 
 * @param {string} keyword  keyword that is in the sheet name or title.
 * @param {Object} spreadSheet   spreadsheet that contains the sheet to be found.
 * 
 * @returns {Array} the found sheet or an empty array when the sheet is not found.
 */
const _getSheet = (keyword, spreadSheet) =>
  Object.keys(spreadSheet).reduce((acc, name) => {
    const keyContains = containsSubstring(name, keyword);
    const sheet = spreadSheet[name];
    const contentContains = sheet && sheet[0] && sheet[0][0] && containsSubstring(sheet[0][0], keyword);
    return (keyContains || contentContains) ? sheet : acc;
  }, []);

const cleanData = (data, type) => {
  if (type === 'number') {
    return data;
  } else {
    return data ? data : '';
  }
}

/**
 * Collect, clean and format all the sheet data.
 * 
 * @param {[Object]} sheetModel a model of the sheet containing for each field its name and type.  
 * @param {Array} sheet         a matrix that contain all the sheet cells.     
 * 
 * @returns {[Object]} an array of objects where each object is one person info on the sheet. 
 */
const _getSheetData = (sheetModel, sheet) => {
  const headerLine = _getHeaderLine(sheet);
  const isDataLine = line => line.length > 1 && !!line[1];
  return sheet
    .filter((line, index) => index >= headerLine && line.length >= sheetModel.length && isDataLine(line))
    .map(line =>
      sheetModel.reduce((sheetData, field, index) => {
        sheetData[field.fieldName] = cleanData(line[index], field.type); //TODO: clean data according to its type
        if (field.type === 'number' && !!line[index] && typeof line[index] !== "number") {
          throw new Error('Eu sabia que estava bom demais!!!!' + ' --> ' + field.fieldName + ' --> ' + line[index]);
        }
        return { ...sheetData };
      }, {}));
};

/**
 * Get the contracheque data from the spreadsheet.
 * 
 * @param {Object} spreadSheet the whole spreadsheet object.
 * 
 * @returns {[Object]} the spreadsheet data.
 */
const _getContrachequeData = spreadSheet => {
  const contrachequeModel = [
    { fieldName: 'cpf', type: 'text' },
    { fieldName: 'nome', type: 'text' },
    { fieldName: 'cargo', type: 'text' },
    { fieldName: 'lotacao', type: 'text' },
    { fieldName: 'subsidio', type: 'number' },
    { fieldName: 'direitos_pessoias', type: 'number' },
    { fieldName: 'indenizacoes', type: 'number' },
    { fieldName: 'direitos_eventuais', type: 'number' },
    { fieldName: 'total_de__rendimentos', type: 'number' },
    { fieldName: 'previdencia_publica', type: 'number' },
    { fieldName: 'imposto_de_renda', type: 'number' },
    { fieldName: 'descontos_diversos', type: 'number' },
    { fieldName: 'retencao_por_teto_constitucional', type: 'number' },
    { fieldName: 'total_de_descontos', type: 'number' },
    { fieldName: 'rendimento_liquido', type: 'number' },
    { fieldName: 'remuneracao_do_orgao_de_origem', type: 'number' },
    { fieldName: 'diarias', type: 'number' }
  ];

  //TODO: throw an error if the sheet isnt in the spreadsheet????

  return _getSheetData(contrachequeModel, _getSheet(CONTRACHEQUE_KEYWORD, spreadSheet));
};

/**
 * Returns an array with the header values.
 * 
 * @param {Array} sheet the sheet that contains the header. 
 */
const _getHeader = sheet => {
  const headerLine = _getHeaderLine(sheet);
  const header = [...sheet[headerLine]];
  if (header && header.length > 1) {
    header[0] = 'cpf';
    header[1] = 'nome';
    let afterEmptyCol = false;
    const cleanHeader = [...header].filter(col => {
      if (!col) { afterEmptyCol = true };
      return !afterEmptyCol;
    });
    return cleanHeader;
  }
  return [];
};

/**
 * Get the contracheque data from the spreadsheet.
 * 
 * @param {Object} spreadSheet the whole spreadsheet object.
 * 
 * @returns {[Object]} the spreadsheet data.
 */
const _getSubsidioData = spreadSheet => {
  const sheet = _getSheet(SUBSIDIO_KEYWORD, spreadSheet);
  let outraSize = Math.floor((_getHeader(sheet).length - 4) / 2);

  const outraColumns = [...Array(outraSize).keys()].map(index => [
    { fieldName: `subsidio_outra${index + 1}`, type: 'number' },
    { fieldName: `subsidio_detalhe${index + 1}`, type: 'text' }
  ]).reduce((acc, el) => [...acc, ...el], []);

  const subsidioModel = [
    { fieldName: 'cpf', type: 'text' },
    { fieldName: 'nome', type: 'text' },
    { fieldName: 'abono_de_permanencia', type: 'number' },
    ...outraColumns,
    { fieldName: 'total_de_direitos_pessoais', type: 'number' },
  ];

  //TODO: truncate numbers and convert undefined to empty string

  //TODO: throw an error if the sheet isnt in the spreadsheet????

  const sheetData = _getSheetData(subsidioModel, sheet);

  return sheetData.map(dataObj => {
    const subsidio_outras = Object.keys(dataObj)
      .filter(key => key.includes('subsidio_outra'))
      .reduce((totalSum, key) => {
        return totalSum + dataObj[key];
      }, 0);

    const subsidio_detalhes = Object.keys(dataObj)
      .filter(key => key.includes('subsidio_detalhe'))
      .reduce((totalConcat, key) => {
        return dataObj[key] ? `${totalConcat}${totalConcat ? ' | ' : ''}${dataObj[key]}` : totalConcat;
      }, '');
    
    const filteredDataObj = Object.keys(dataObj)
      .filter(key => !key.includes('subsidio_outra') && !key.includes('subsidio_detalhe'))
      .reduce((obj, key) => ({...obj, [key]: dataObj[key]}), {});
    
    return {
      ...filteredDataObj,
      subsidio_outras,
      subsidio_detalhes
    }
  });
};

/**
 * Parses the spreadsheet object generated by the XLSX lib into the formated and clean object containing the extracted info. 
 
 * @param {Array} spreadsheet the spreadsheet object. 
 */
const parse = spreadsheet => {
  // get data from each sheet
  // join the data
  /**
   * join the data will require an experiment to see if the key to join the data in the sheets can be the person name.
   */
  throw new Error('not implemented yet');
};



module.exports = { parse, _getHeaderLine, _getSheet, _getSheetData, _getContrachequeData, _getSubsidioData, _getHeader };