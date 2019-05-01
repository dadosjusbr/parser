const supertest = require('supertest');
const nock = require('nock');
const app = require('../src/server');
const { getSpreadsheet, SIMPLE_DATA_SPREADSHEET_PATH } = require('./spreadsheets');
const schemaService = require('../src/schema_service.js');
const schema = require('../src/schema.js');

const server = app.listen();
const request = supertest.agent(server)

afterAll(function (done) {
  server.close(done)
});

describe('GET /', () => {
  const url = 'http://www.test.com/sheet.xls';

  it('Should respond success status code and the correct message', async () => {
    const spreadsheet = await getSpreadsheet(SIMPLE_DATA_SPREADSHEET_PATH);
    nock(url).get('').reply(200, spreadsheet);
    const response = await request.get(`/?spreadsheetUrl=${url}`);
    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch(`cpf,nome,cargo,lotacao,subsidio,direitos_pessoais,indenizacoes,direitos_eventuais,total_de__rendimentos,previdencia_publica,imposto_de_renda,descontos_diversos,retencao_por_teto_constitucional,total_de_descontos,rendimento_liquido,remuneracao_do_orgao_de_origem,diarias,abono_de_permanencia,total_de_direitos_pessoais,subsidio_outras,subsidio_detalhes,auxilio_alimentacao,auxilio_pre_escolar,auxilio_saude,auxilio_natalidade,auxilio_moradia,ajuda_de_custo,total_indenizacoes,indenizacoes_outras,indenizacoes_detalhes,abono_contitucional_de_1_3_de_ferias,indenizacao_de_ferias,antecipacao_de_ferias,gratificacao_natalina,antecipacao_de_gratificacao_natalina,substituicao,gratificacao_por_exercicio_cumulativo,gratificacao_por_encargo_curso_concurso,pagamento_em_retroativos,jeton,total_de_direitos_eventuais,direitos_eventuais_outras,direitos_eventuais_detalhes,matricula,lotacao_de_origem,orgao_de_origem,cargo_de_origem
xxx.xxx.xxx-xx,Nome1,Juiz Eleitoral,CARTÓRIO ELEITORAL,11,63.5,459,792,1325.5,21,31,41,51,61,1264.5,71,81,11.5,63.5,52,asdf1 | qwer1,11,21,31,41,51,61,459,243,poiu1 | mnbv1 | zxcv1,11,21,31,41,51,61,71,81,91,101,792,232,Gratificação Eleitoral | fdsa1,1,Juiz Eleitoral,TJRN,Juiz de Direito
xxx.xxx.xxx-xx,Nome2,Juiz Eleitoral,CARTÓRIO ELEITORAL,12,66,468,804,1350,22,32,42,52,62,1288,72,82,12,66,54,asdf2 | qwer2,12,22,32,42,52,62,468,246,poiu2 | mnbv2 | zxcv2,12,22,32,42,52,62,72,82,92,102,804,234,Gratificação Eleitoral | fdsa2,2,Juiz Eleitoral,TJRN,Juiz de Direito
xxx.xxx.xxx-xx,Nome3,Juiz Eleitoral,CARTÓRIO ELEITORAL,13,69,477,816,1375,23,33,43,53,63,1312,73,83,13,69,56,asdf3 | qwer3,13,23,33,43,53,63,477,249,poiu3 | mnbv3 | zxcv3,13,23,33,43,53,63,73,83,93,103,816,236,Gratificação Eleitoral | fsa3,3,Juiz Eleitoral,TJRN,Juiz de Direito
xxx.xxx.xxx-xx,nome4,Juiz Eleitoral,CARTÓRIO ELEITORAL,14,72,486,828,1400,24,34,44,54,64,1336,74,84,14,72,58,asdf4 | qwer4,14,24,34,44,54,64,486,252,poiu4 | mnbv4 | zxcv4,14,24,34,44,54,64,74,84,94,104,828,238,Gratificação Eleitoral | fdsa4,4,Juiz Eleitoral,TJRN,Juiz de Direito`);
  });

  it('Should respond bad request status code when no url is passed in query params', async () => {
    const response = await request.get('/');
    expect(response.statusCode).toBe(400);
    const responseObj = JSON.parse(response.text);
    expect(responseObj.message).toEqual('Invalid spreadsheet url!');
  });
});

describe('GET /schema', () => {
  it('should respond success status code and the loaded schema', async () => {
    const response = await request.get(`/schema`);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toEqual(schema);
  });
});