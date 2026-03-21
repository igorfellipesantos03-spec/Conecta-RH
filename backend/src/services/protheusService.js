const axios = require('axios');

// URLs da API do Protheus
const PROTHEUS_AUTH_URL =
  'https://restauth.protheusteste.conasa.com/rest/api/oauth2/v1/token?grant_type=password';
const PROTHEUS_DATA_URL =
  'https://restauth.protheusteste.conasa.com/rest/rh/v1/employeedatacontent/';

/**
 * Obtém o access_token do Protheus via OAuth2 (grant_type=password)
 */
async function getProtheusToken() {
  const response = await axios.post(
    PROTHEUS_AUTH_URL,
    new URLSearchParams({
      username: process.env.PROTHEUS_USER,
      password: process.env.PROTHEUS_PASSWORD,
    }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  return response.data.access_token;
}

/**
 * Busca funcionários no Protheus pelo nome
 * @param {string} 
 */
async function buscarFuncionarios(nomeBusca) {
  const token = await getProtheusToken();

  const response = await axios.get(PROTHEUS_DATA_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      product: 'PROTHEUS',
      companyId: '07',
      branchId: '01',
      fields: 'companyKey,branch,code,name,id,cpf,RA_CIC',
      filter: "RA_NOMECMP LIKE '" + nomeBusca.toUpperCase() + "%'",
    },
  });

  return response.data;
}

/**
 * Busca funcionário no Protheus pelo CPF e dados do token (company/branch)
 */
async function buscarFuncionarioPorCpf(cpf, companyId, branchId) {
  const token = await getProtheusToken();
  const cpfLimpo = cpf.replace(/\D/g, '');

  const response = await axios.get(PROTHEUS_DATA_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      product: 'PROTHEUS',
      companyId: companyId,
      branchId: branchId,
      fields: 'companyKey,branch,code,name,id,cpf,RA_CIC',
      filter: "RA_CIC = '" + cpfLimpo + "'",
    },
  });

  return response.data;
}

module.exports = { getProtheusToken, buscarFuncionarios, buscarFuncionarioPorCpf };
