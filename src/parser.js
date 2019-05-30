const { containsSubstring } = require('./string_utils');
const errorMessages = require('./error_messages');
const APIError = require('./api_error');
const httpStatus = require('http-status');

/**
 * Keywords contained on each name or title.  
 */
const CONTRACHEQUE_KEYWORD = 'contracheque',
  SUBSIDIO_KEYWORD = 'pessoais',
  INDENIZACOES_KEYWORD = 'INDENIZAÇÕES',
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

/**
 * Clean the data based on its type.
 * 
 * @param {String | Number} data  data that will be clean. 
 * @param {String} type           data type.
 * 
 * @returns {String | Number} clean data.
 */
const _cleanData = (data, type) => {
  if (type === 'number') {
    return data ? data : 0;
  } else {
    return data || data === 0 ? data : '';
  }
};

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
        sheetData[field.fieldName] = _cleanData(line[index], field.type);
        return { ...sheetData };
      }, {}));
};

const checkEmptySheet = (sheet, sheetName) => {
  if (sheet.length === 0) {
    const { message, code } = errorMessages.SHEET_NOT_FOUND(sheetName);
    throw new APIError(message, httpStatus.NOT_FOUND, code);
  }
}

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
    { fieldName: 'direitos_pessoais', type: 'number' },
    { fieldName: 'indenizacoes', type: 'number' },
    { fieldName: 'direitos_eventuais', type: 'number' },
    { fieldName: 'total_de_rendimentos', type: 'number' },
    { fieldName: 'previdencia_publica', type: 'number' },
    { fieldName: 'imposto_de_renda', type: 'number' },
    { fieldName: 'descontos_diversos', type: 'number' },
    { fieldName: 'retencao_por_teto_constitucional', type: 'number' },
    { fieldName: 'total_de_descontos', type: 'number' },
    { fieldName: 'rendimento_liquido', type: 'number' },
    { fieldName: 'remuneracao_do_orgao_de_origem', type: 'number' },
    { fieldName: 'diarias', type: 'number' }
  ];

  const sheet = _getSheet(CONTRACHEQUE_KEYWORD, spreadSheet);
  checkEmptySheet(sheet, 'contracheque');

  return _getSheetData(contrachequeModel, sheet);
};


const _getOrgao = contrachequeSheet => {
  let orgao = "";
  const orgaoLabel = "Órgão";
  const found = contrachequeSheet.some(line => {
    if (line[0] && isNaN(line[0]) && line[0].trim() === orgaoLabel) {
      orgao = line.reduce((acc, el) => {
        return !!el ? el : acc;
      }, "");
      return true;
    }
    return false;
  });
  if (!found) {
    const { message, code } = errorMessages.SPREASHEET_DATA_NOT_FOUND(orgaoLabel);
    throw new APIError(message, httpStatus.NOT_FOUND, code);
  }
  return orgao;
};

const excelDateToJSDate = date => new Date(Math.round((date - 25569) * 86400 * 1000));
const isLiteralDateMMYYYY = str => /^(0[\d]|1[0-2])\/?([\d]{4})$/.test(str);
const isLiteralDateMMYY = str => /^(0[\d]|1[0-2])\/?([\d]{2})$/.test(str);

const _getMesReferencia = contrachequeSheet => {
  let mesReferencia = "";
  const mesLabel = "Mês/Ano de Referência";
  const found = contrachequeSheet.some(line => {
    if (line[0] && isNaN(line[0]) && line[0].trim() === mesLabel) {
      mesReferencia = line.reduce((acc, el, i) => {
        if (i === 0) return acc;
        if (!!el) {
          //el is the excel date format (number of days after 1/1/1900)
          if (!isNaN(el) && typeof el !== "object") {
            const d = excelDateToJSDate(el);
            return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`;
            //el is a literal string date on format mm/yy
          } else if (isLiteralDateMMYY(el)) {
            const [mm, yy] = el.split("/");
            return `20${yy}-${Number(mm)}`;
            //el is a literal string date on format mm/yyyy
          } else if (isLiteralDateMMYYYY(el)) {
            const [mm, yyyy] = el.split("/");
            return `${yyyy}-${Number(mm)}`;
            //el is an Date generated by xslx lib
          } else {
            const d = new Date(el);
            return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`;
          }
        }
        return acc;
      }, "");
      return true;
    }
    return false;
  });
  if (!found) {
    const { message, code } = errorMessages.SPREASHEET_DATA_NOT_FOUND(mesLabel);
    throw new APIError(message, httpStatus.NOT_FOUND, code);
  }
  return mesReferencia;
};
/**
 * Get the subsidio data from the spreadsheet.
 * 
 * @param {Object} spreadSheet the whole spreadsheet object.
 * 
 * @returns {[Object]} the spreadsheet data.
 */
const _getSubsidioData = spreadSheet => {
  const sheetKey = 'subsidio';
  const fixedColsSize = 4;

  const sheet = _getSheet(SUBSIDIO_KEYWORD, spreadSheet);
  checkEmptySheet(sheet, 'subsidios');

  const outraCols = _getOutraAndDetalheColumns(sheet, sheetKey, fixedColsSize);

  const subsidioModel = [
    { fieldName: 'cpf', type: 'text' },
    { fieldName: 'nome', type: 'text' },
    { fieldName: 'abono_de_permanencia', type: 'number' },
    ...outraCols,
    { fieldName: 'total_de_direitos_pessoais', type: 'number' },
  ];

  const sheetData = _getSheetData(subsidioModel, sheet);

  return sheetData.map(sheetLineObj => {
    const subsidio_outras = _joinOutraColumns(sheetLineObj);
    const subsidio_detalhes = _joinDetalheColumns(sheetLineObj);
    const filteredLineObj = _filterOutraAndDetalheColumns(sheetLineObj);
    return {
      ...filteredLineObj,
      subsidio_outras,
      subsidio_detalhes
    };
  });
};

/**
 * Get the indenizacoes data from the spreadsheet.
 * 
 * @param {Object} spreadSheet the whole spreadsheet object.
 * 
 * @returns {[Object]} the spreadsheet data.
 */
const _getIndenizacoesData = spreadSheet => {
  const sheetkey = 'indenizacoes';
  const fixedColsSize = 9;

  const sheet = _getSheet(INDENIZACOES_KEYWORD, spreadSheet);
  checkEmptySheet(sheet, 'indenizações');

  const headerSize = _getHeader(sheet).length;
  if (headerSize < fixedColsSize) {
    const { message, code } = errorMessages.HEADER_SIZE_ERROR(fixedColsSize, headerSize, sheetkey);
    throw new APIError(message, httpStatus.BAD_REQUEST, code);
  }

  const outraCols = _getOutraAndDetalheColumns(sheet, sheetkey, fixedColsSize);

  const indenizacoesModel = [
    { fieldName: 'cpf', type: 'text' },
    { fieldName: 'nome', type: 'text' },
    { fieldName: 'auxilio_alimentacao', type: 'number' },
    { fieldName: 'auxilio_pre_escolar', type: 'number' },
    { fieldName: 'auxilio_saude', type: 'number' },
    { fieldName: 'auxilio_natalidade', type: 'number' },
    { fieldName: 'auxilio_moradia', type: 'number' },
    { fieldName: 'ajuda_de_custo', type: 'number' },
    ...outraCols,
    { fieldName: 'total_indenizacoes', type: 'number' },
  ];

  const sheetData = _getSheetData(indenizacoesModel, sheet);

  return sheetData.map(sheetLineObj => {
    const indenizacoes_outras = _joinOutraColumns(sheetLineObj);
    const indenizacoes_detalhes = _joinDetalheColumns(sheetLineObj);
    const filteredLineObj = _filterOutraAndDetalheColumns(sheetLineObj);
    return {
      ...filteredLineObj,
      indenizacoes_outras,
      indenizacoes_detalhes
    };
  });
};

/**
 * Get the direitosEventuais data from the spreadsheet.
 * 
 * @param {Object} spreadSheet the whole spreadsheet object.
 * 
 * @returns {[Object]} the spreadsheet data.
 */
const _getDireitosEventuaisData = spreadSheet => {
  const sheetkey = 'direitos_eventuais';
  const fixedColsSize = 13;

  const sheet = _getSheet(DIREITOS_EVENTUAIS_KEYWORD, spreadSheet);
  checkEmptySheet(sheet, 'direitos eventuais');

  const outraCols = _getOutraAndDetalheColumns(sheet, sheetkey, fixedColsSize);

  const direitosEventuaisModel = [
    { fieldName: 'cpf', type: 'text' },
    { fieldName: 'nome', type: 'text' },
    { fieldName: 'abono_contitucional_de_1_3_de_ferias', type: 'number' },
    { fieldName: 'indenizacao_de_ferias', type: 'number' },
    { fieldName: 'antecipacao_de_ferias', type: 'number' },
    { fieldName: 'gratificacao_natalina', type: 'number' },
    { fieldName: 'antecipacao_de_gratificacao_natalina', type: 'number' },
    { fieldName: 'substituicao', type: 'number' },
    { fieldName: 'gratificacao_por_exercicio_cumulativo', type: 'number' },
    { fieldName: 'gratificacao_por_encargo_curso_concurso', type: 'number' },
    { fieldName: 'pagamento_em_retroativos', type: 'number' },
    { fieldName: 'jeton', type: 'number' },
    ...outraCols,
    { fieldName: 'total_de_direitos_eventuais', type: 'number' },
  ];

  const sheetData = _getSheetData(direitosEventuaisModel, sheet);

  return sheetData.map(sheetLineObj => {
    const direitos_eventuais_outras = _joinOutraColumns(sheetLineObj);
    const direitos_eventuais_detalhes = _joinDetalheColumns(sheetLineObj);
    const filteredLineObj = _filterOutraAndDetalheColumns(sheetLineObj);
    return {
      ...filteredLineObj,
      direitos_eventuais_outras,
      direitos_eventuais_detalhes
    };
  });
};

/**
 * Get the dadosCadastrais data from the spreadsheet.
 * 
 * @param {Object} spreadSheet the whole spreadsheet object.
 * 
 * @returns {[Object]} the spreadsheet data.
 */
const _getDadosCadastraisData = spreadSheet => {
  const dadosCadastraisModel = [
    { fieldName: 'cpf', type: 'text' },
    { fieldName: 'nome', type: 'text', key: true },
    { fieldName: 'matricula', type: 'text' },
    { fieldName: 'lotacao_de_origem', type: 'text' },
    { fieldName: 'orgao_de_origem', type: 'text' },
    { fieldName: 'cargo_de_origem', type: 'text' },
  ];
  return _getSheetData(dadosCadastraisModel, _getSheet(DADOS_CADASTRAIS_KEYWORD, spreadSheet));
};

/**
 * Returns an array with the header values.
 * 
 * @param {Array} sheet the sheet that contains the header. 
 */
const _getHeader = sheet => {
  const headerLine = _getHeaderLine(sheet);
  const header = sheet.length && [...sheet[headerLine]];
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
 * Get outra and detalhe columns to put into the sheet model based on its header size.
 * 
 * @param {Array} sheet     the sheet matrix.
 * @param {string} sheetKey a key related to the sheet to fill the field name.
 * 
 * @returns {[Object]} a sheet model of its outra and detalhe columns.
 */
const _getOutraAndDetalheColumns = (sheet, sheetKey, fixedColsSize = 0) => {
  const outraSize = Math.floor((_getHeader(sheet).length - fixedColsSize) / 2);

  if (outraSize <= 0) return [];

  return [...Array(outraSize).keys()].map(index => [
    { fieldName: `${sheetKey}_outra${index + 1}`, type: 'number' },
    { fieldName: `${sheetKey}_detalhe${index + 1}`, type: 'text' }
  ]).reduce((acc, el) => [...acc, ...el], []);
};

/**
 * Find and sum all the outra columns values in the sheet line.
 * 
 * @param {Object} sheetLineObj an object that contains all data from a sheet line.
 * 
 * @returns {number} the sum of all the outra culumns data. 
 */
const _joinOutraColumns = sheetLineObj =>
  Object.keys(sheetLineObj)
    .filter(key => key.includes('_outra'))
    .reduce((totalSum, key) => {
      return totalSum + sheetLineObj[key];
    }, 0);

/**
 * Find and join all the detalhe columns values in the sheet line.
 * 
 * @param {Object} sheetLineObj an object that contains all data from a sheet line.
 * 
 * @returns {number} the joined string of all the detalhe culumns. 
 */
const _joinDetalheColumns = sheetLineObj =>
  Object.keys(sheetLineObj)
    .filter(key => key.includes('_detalhe'))
    .reduce((totalConcat, key) => {
      return sheetLineObj[key] ? `${totalConcat}${totalConcat ? ' | ' : ''}${sheetLineObj[key]}` : totalConcat;
    }, '');

/**
 * Return an object without all the outra and detalhe data.
 * 
 * @param {Object} sheetLineObj an object that contains all data from a sheet line.
 * 
 * @returns {Object} a sheet line object without the outra and detalhe properties.
 */
const _filterOutraAndDetalheColumns = sheetLineObj =>
  Object.keys(sheetLineObj)
    .filter(key => !key.includes('_outra') && !key.includes('_detalhe'))
    .reduce((obj, key) => ({ ...obj, [key]: sheetLineObj[key] }), {});

/**
 * Convert an array of sheet row objects into a hash map where the key is the magistrado name.
 * 
 * @param {[Object]} sheet the data collected from the original sheet
 * 
 * @returns {Object} the generated hash map. 
 */
const _convertToNameHashTable = sheet => {
  return sheet.reduce((hashTable, row) => {
    hashTable[row.nome] = row;
    return hashTable;
  }, {});
};

//TODO: gererate this default values from each sheet model.
const subsidiosDefaultData = {
  abono_de_permanencia: 0,
  total_de_direitos_pessoais: 0,
  subsidio_outras: 0,
  subsidio_detalhes: ''
};

const indenizacoesDefaultData = {
  auxilio_alimentacao: 0,
  auxilio_pre_escolar: 0,
  auxilio_saude: 0,
  auxilio_natalidade: 0,
  auxilio_moradia: 0,
  ajuda_de_custo: 0,
  total_indenizacoes: 0,
  indenizacoes_outras: 0,
  indenizacoes_detalhes: ''
};

const direitosEventuaisDefaultData = {
  abono_contitucional_de_1_3_de_ferias: 0,
  indenizacao_de_ferias: 0,
  antecipacao_de_ferias: 0,
  gratificacao_natalina: 0,
  antecipacao_de_gratificacao_natalina: 0,
  substituicao: 0,
  gratificacao_por_exercicio_cumulativo: 0,
  gratificacao_por_encargo_curso_concurso: 0,
  pagamento_em_retroativos: 0,
  jeton: 0,
  total_de_direitos_eventuais: 0,
  direitos_eventuais_outras: 0,
  direitos_eventuais_detalhes: ''
};

const dadosCadastraisDefaultData = {
  matricula: 0,
  lotacao_de_origem: '',
  orgao_de_origem: '',
  cargo_de_origem: ''
};

/**
 * Parses the spreadsheet object generated by the XLSX lib into the formated and clean object containing the extracted info. 
 
 * @param {Array} spreadsheet the spreadsheet object. 
 */
const parse = spreadsheet => {
  const contrachequeData = _convertToNameHashTable(_getContrachequeData(spreadsheet));
  const subsidioData = _convertToNameHashTable(_getSubsidioData(spreadsheet));
  const indenizacoesData = _convertToNameHashTable(_getIndenizacoesData(spreadsheet));
  const direitosEventuais = _convertToNameHashTable(_getDireitosEventuaisData(spreadsheet));
  const dadosCadastrais = _convertToNameHashTable(_getDadosCadastraisData(spreadsheet));

  const contrachequeSheet = _getSheet(CONTRACHEQUE_KEYWORD, spreadsheet);
  const orgao = _getOrgao(contrachequeSheet);
  const mes_ano_referencia = _getMesReferencia(contrachequeSheet);

  return Object.keys(contrachequeData).map(name => {
    return {
      ...contrachequeData[name],
      ...(subsidioData[name] || subsidiosDefaultData),
      ...(indenizacoesData[name] || indenizacoesDefaultData),
      ...(direitosEventuais[name] || direitosEventuaisDefaultData),
      ...(dadosCadastrais[name] || dadosCadastraisDefaultData),
      orgao,
      mes_ano_referencia,
    };
  });
};

module.exports = {
  parse, _getHeaderLine, _getSheet, _getSheetData, _getContrachequeData, _getSubsidioData,
  _cleanData, _getHeader, _getOutraAndDetalheColumns, _joinOutraColumns, _joinDetalheColumns,
  _filterOutraAndDetalheColumns, _getIndenizacoesData, _getDireitosEventuaisData, _getDadosCadastraisData,
  _convertToNameHashTable, _getOrgao, _getMesReferencia
};