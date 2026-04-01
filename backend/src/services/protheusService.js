const axios = require('axios');

// URLs da API do Protheus
const PROTHEUS_AUTH_URL =
  'https://restauth.protheusteste.conasa.com/rest/api/oauth2/v1/token?grant_type=password';
const PROTHEUS_DATA_URL =
  'https://restauth.protheusteste.conasa.com/rest/rh/v1/employeedatacontent/';

/**
 * Obtém um access_token de SISTEMA do Protheus (credenciais fixas do .env).
 * Usar SOMENTE para rotas públicas que não possuem sessão de usuário
 * (ex: validação de CPF no formulário DISC público).
 */
async function getSystemToken() {
  const response = await axios.post(
    PROTHEUS_AUTH_URL,
    new URLSearchParams({
      username: process.env.PROTHEUS_SYSTEM_USER,
      password: process.env.PROTHEUS_SYSTEM_PASSWORD,
    }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  return response.data.access_token;
}

/**
 * Obtém o access_token do Protheus via OAuth2 (grant_type=password) 
 * de forma dinâmica para login de usuários.
 */
async function getProtheusTokenDynamic(username, password) {
  const response = await axios.post(
    PROTHEUS_AUTH_URL,
    new URLSearchParams({
      username: username,
      password: password,
    }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  return response.data;
}

/**
 * Busca funcionários no Protheus pelo nome.
 * Refatorado para receber 4 parâmetros: token do usuário, termo de busca,
 * código da empresa e código da filial.
 *
 * @param {string} userProtheusToken - Token OAuth2 do Protheus do usuário logado
 * @param {string} nomeBusca - Nome (ou parte do nome) para filtrar
 * @param {string} companyId - Código da empresa (ex: '07')
 * @param {string} branchId - Código da filial (ex: '01')
 */
async function buscarFuncionarios(userProtheusToken, nomeBusca, companyId, branchId) {
  const params = {
    product: 'PROTHEUS',
    companyId: companyId,
    fields: 'companyKey,branch,code,name,id,cpf,RA_CIC',
    filter: "RA_NOMECMP LIKE '" + nomeBusca.toUpperCase() + "%'",
  };

  if (branchId) {
    params.branchId = branchId;
  }

  const response = await axios.get(PROTHEUS_DATA_URL, {
    headers: {
      Authorization: `Bearer ${userProtheusToken}`,
    },
    params,
  });

  return response.data;
}

/**
 * Busca funcionário no Protheus pelo CPF.
 * Versão com token explícito (para rotas autenticadas).
 *
 * @param {string} userProtheusToken - Token OAuth2 do Protheus
 * @param {string} cpf - CPF do funcionário
 * @param {string} companyId - Código da empresa
 * @param {string} branchId - Código da filial
 */
async function buscarFuncionarioPorCpf(userProtheusToken, cpf, companyId, branchId) {
  const cpfLimpo = cpf.replace(/\D/g, '');

  const params = {
    product: 'PROTHEUS',
    companyId: companyId,
    fields: 'companyKey,branch,code,name,id,cpf,RA_CIC',
    filter: "RA_CIC = '" + cpfLimpo + "'",
  };

  if (branchId) {
    params.branchId = branchId;
  }

  const response = await axios.get(PROTHEUS_DATA_URL, {
    headers: {
      Authorization: `Bearer ${userProtheusToken}`,
    },
    params,
  });

  return response.data;
}

/**
 * Busca funcionário no Protheus pelo CPF usando token de SISTEMA.
 * Usar para rotas públicas onde não há sessão de usuário (ex: check-cpf).
 */
async function buscarFuncionarioPorCpfSistema(cpf, companyId, branchId) {
  const token = await getSystemToken();
  return buscarFuncionarioPorCpf(token, cpf, companyId, branchId);
}

module.exports = {
  getSystemToken,
  getProtheusTokenDynamic,
  buscarFuncionarios,
  buscarFuncionarioPorCpf,
  buscarFuncionarioPorCpfSistema
};
