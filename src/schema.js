module.exports = {
  "version": "1",
  "fields": [
    {
      "name": "CPF",
      "title": "CPF do Magistrado",
      "type": "string",
      "description": "O CPF do Magistrado (geralmente não informado nas planilhas)"
    },
    {
      "name": "nome",
      "title": "Nome do Magistrado",
      "type": "string",
      "description": "Nome do Magistrado"
    },
    {
      "name": "cargo",
      "title": "Cargo do Magistrado",
      "type": "string",
      "description": "Cargo desempenhado pelo Magistrado"
    },
    {
      "name": "lotacao",
      "title": "Lotação do Magistrado",
      "type": "string",
      "description": "Órgão que o Magistrado está administrativamente vinculado"
    },
    {
      "name": "subsidio",
      "title": "Subsídio",
      "type": "number",
      "description": "Salário recebido pelo magistrado"
    },
    {
      "name": "direitos_pessoais",
      "title": "Direitos Pessoais",
      "type": "number",
      "description": "Total recebido através de direitos pessoais"
    },
    {
      "name": "indenizacoes",
      "title": "Indenizações",
      "type": "number",
      "description": "Total recebido através de indenizações"
    },
    {
      "name": "direitos_eventuais",
      "title": "Direitos Eventuais",
      "type": "number",
      "description": "Total recebido através de direitos eventuais"
    },
    {
      "name": "total_de_rendimentos",
      "title": "Total de Rendimentos",
      "type": "number",
      "description": "Total de rendimentos do Magistrado"
    },
    {
      "name": "previdencia_publica",
      "title": "Previdência pública",
      "type": "number",
      "description": "Desconto relativo a previdência pública sobre os rendimentos do Magistrado"
    },
    {
      "name": "imposto_de_renda",
      "title": "Imposto de Renda",
      "type": "number",
      "description": "Desconto relativo a imposto de renda sobre os rendimentos do Magistrado"
    },
    {
      "name": "descontos_diversos",
      "title": "Descontos diversos",
      "type": "number",
      "description": "Descontos não especificados.Podem incluir qualquer outro desconto de caráter não-pessoal"
    },
    {
      "name": "retencao_por_teto_constitucional",
      "title": "Retenção por teto constitucional",
      "type": "number",
      "description": "Corte nas remunerações por exceder teto de salário de servidores públicos, limitado ao salário dos ministros do STF"
    },
    {
      "name": "total_de_descontos",
      "title": "Total de Descontos",
      "type": "number",
      "description": "Somatório de todos os descontos aplicados à remuneração do Magistrado"
    },
    {
      "name": "rendimento_liquido",
      "title": "Rendimento Líquido",
      "type": "number",
      "description": "Subsídios + Adicionais - Descontos"
    },
    {
      "name": "remuneracao_do_orgao_de_origem",
      "title": "Remuneração do Órgão de Origem",
      "type": "number",
      "description": "Recebimentos do tribunal onde o Magistrado 'entrou' no Judiciário"
    },
    {
      "name": "diarias",
      "title": "Diárias",
      "type": "number",
      "description": "Reembolso por despesas em serviços externos: alimentação, transporte, hospedagem e outros"
    },
    {
      "name": "abono_de_permanencia",
      "title": "Abono de Permanência",
      "type": "number",
      "description": "Bônus concedido a quem alcançou os requisitos para se aposentar, mas optou por permanecer em atividade"
    },
    {
      "name": "subsidio_outra1",
      "title": "Outros recebimentos - Subsídio 1",
      "type": "number",
      "description": "Subsídio detalhado na coluna 'subsidio_detalhe1'"
    },
    {
      "name": "subsidio_detalhe1",
      "title": "Detalhe Outros Recebimentos - Subsídio 1",
      "type": "string",
      "description": "Detalha o valor recebido especificado na coluna 'subsidio_outra1'"
    },
    {
      "name": "subsidio_outra2",
      "title": "Outros recebimentos - Subsídio 2",
      "type": "number",
      "description": "Subsídio detalhado na coluna 'subsidio_detalhe2'"
    },
    {
      "name": "subsidio_detalhe2",
      "title": "Detalhe Outros Recebimentos - Subsídio 2",
      "type": "string",
      "description": "Detalha o valor recebido especificado na coluna 'subsidio_outra2'"
    },
    {
      "name": "total_de_direitos_pessoais",
      "title": "Total de Direitos Pessoais",
      "type": "number",
      "description": "Somatório de todos os rendimentos de direitos pessoais"
    },
    {
      "name": "auxilio_alimentacao",
      "title": "Auxílio Aliemtação",
      "type": "number",
      "description": "Indeniza gastos com alimentação"
    },
    {
      "name": "auxilio_pre_escolar",
      "title": "Auxílio pré escolar",
      "type": "number",
      "description": "Também conhecido como auxílio creche, objetiva oferecer assistência ao atendimento de seus dependentes em idade pré-escolar"
    },
    {
      "name": "auxilio_saude",
      "title": "Auxílio Saúde",
      "type": "number",
      "description": "Concedido para custeio dos gastos com planos de saúde"
    },
    {
      "name": "auxilio_natalidade",
      "title": "Auxílio Natalidade",
      "type": "number",
      "description": "Concedido por motivo de nascimento de filho"
    },
    {
      "name": "auxilio_moradia",
      "title": "Auxílio Moradia",
      "type": "number",
      "description": "Ressarcimento de despesas comprovadamente realizadas pelo servidor com aluguel de moradia ou com hospedagem em empresa hoteleira"
    },
    {
      "name": "ajuda_de_custo",
      "title": "Ajuda de Custo",
      "type": "number",
      "description": "Inclui despesas como mudança de cidade do magistrado e auxílios diversos - como bolsa livro"
    },
    {
      "name": "indenizacoes_outra1",
      "title": "",
      "type": "number",
      "description": ""
    },
    {
      "name": "indenizacoes_detalhe1",
      "title": "",
      "type": "string",
      "description": ""
    },
    {
      "name": "indenizacoes_outra2",
      "title": "",
      "type": "number",
      "description": ""
    },
    {
      "name": "indenizacoes_detalhe2",
      "title": "",
      "type": "string",
      "description": ""
    },
    {
      "name": "indenizacoes_outra3",
      "title": "",
      "type": "number",
      "description": ""
    },
    {
      "name": "indenizacoes_detalhe3",
      "title": "",
      "type": "string",
      "description": ""
    },
    {
      "name": "total_indenizacoes",
      "title": "Total de Indenizações",
      "type": "number",
      "description": "Total de rendimentos com indenizações do Magistrado"
    },
    {
      "name": "abono_contitucional_de_1_3_de_ferias",
      "title": "Abono Constitucional de 1/3 de férias",
      "type": "number",
      "description": "Abono Constitucional de 1/3 de férias"
    },
    {
      "name": "indenizacao_de_ferias",
      "title": "Indenização de Férias",
      "type": "number",
      "description": "Recebido quando o magistrado não utiliza todo o período de férias ao qual tem direito"
    },
    {
      "name": "antecipacao_de_ferias",
      "title": "Antecipação de Férias",
      "type": "number",
      "description": "A antecipação do salário normal que o servidor iria receber no decorrer do período de férias"
    },
    {
      "name": "gratificacao_natalina",
      "title": "Gratificação Natalina",
      "type": "number",
      "description": "1/12 da remuneração por mês trabalhado, o que totaliza um salário extra por ano"
    },
    {
      "name": "antecipacao_de_gratificacao_natalina",
      "title": "Antecipação de Gratificação Natalina",
      "type": "number",
      "description": "Antecipação da Gratificação Natalina"
    },
    {
      "name": "substituicao",
      "title": "Subtituição",
      "type": "number",
      "description": "Gratificação recebida quando um servidor é designado para substituir o ocupante de função gratificada ou cargo comissionado, bem como aquele que percebe gratificação especial correspondente a cargo comissionado ou função gratificada, durante o período de afastamento legal do titular"
    },
    {
      "name": "gratificacao_por_exercicio_cumulativo",
      "title": "Gratificação por Exercício Cumulativo",
      "type": "number",
      "description": "Recebida pelo magistrado que responder, simultaneamente, por duas varas do trabalho ou uma vara e um posto avançado ou ainda quando for responsável pelo seu acervo e de juiz convocado"
    },
    {
      "name": "gratificacao_por_encargo_curso_concurso",
      "title": "Gratificação por Encargo Curso/Concurso",
      "type": "number",
      "description": "Devida ao servidor que, eventualmente, atuar como instrutor em curso de formação, desenvolvimento ou de treinamento; participar de banca examinadora ou de comissão para exames orais, análise curricular, correção de provas discursivas, elaboração de questões ou julgamento de recursos intentados por candidatos; participar da logística de preparação e de realização de concurso público, quando tais atividades não estiverem incluídas entre as suas atribuições permanentes; participar da aplicação, fiscalização, avaliação ou supervisão de provas de vestibular ou concurso público."
    },
    {
      "name": "pagamento_em_retroativos",
      "title": "Pagamentos em Retroativos",
      "type": "number",
      "description": ""
    },
    {
      "name": "jeton",
      "title": "Jeton",
      "type": "number",
      "description": "Gratificação pela participação em reuniões de órgãos de deliberação coletiva da administração centralizada e autárquica"
    },
    {
      "name": "direitos_eventuais_outra1",
      "title": "",
      "type": "number",
      "description": ""
    },
    {
      "name": "direitos_eventuais_detalhe1",
      "title": "",
      "type": "string",
      "description": ""
    },
    {
      "name": "direitos_eventuais_outra2",
      "title": "",
      "type": "number",
      "description": ""
    },
    {
      "name": "direitos_eventuais_detalhe2",
      "title": "",
      "type": "string",
      "description": ""
    },
    {
      "name": "total_de_direitos_eventuais",
      "title": "Total de Direitos Eventuais",
      "type": "number",
      "description": "Total de rendimentos com diretiros eventuais do Magistrado"
    },
    {
      "name": "matricula",
      "title": "Matícula",
      "type": "string",
      "description": "Matrícula do Magistrado, não há especificação de nenhuma regra sobre essa matrícula"
    },
    {
      "name": "lotacao_de_origem",
      "title": "Lotação de Origem",
      "type": "string",
      "description": ""
    },
    {
      "name": "orgao_de_origem",
      "title": "Órgão de origem",
      "type": "string",
      "description": ""
    },
    {
      "name": "cargo_de_origem",
      "title": "Cargo de origem",
      "type": "string",
      "description": ""
    },
    {
      "name": "mes_ano_referencia",
      "title": "Mês/Ano de Referência",
      "type": "string",
      "description": "Mês e ano de referência da planilha"
    },
    {
      "name": "orgao",
      "title": "Órgão de referência da planilha",
      "type": "string",
      "description": "Órgão de referência da planilha"
    }
  ]
};