require('dotenv').config();
const { buscarFuncionarios } = require('./src/services/protheusService');

async function test() {
  try {
    const res = await buscarFuncionarios('igor');
    console.log('Sucesso:', res);
  } catch (err) {
    if (err.response) {
      console.log('--- RESPOSTA DE ERRO COMPLETA ---');
      console.log(JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Erro Genérico:', err.message);
    }
  }
}

test();
