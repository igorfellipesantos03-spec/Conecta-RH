const { calcularDISC } = require('../services/discCalculator');
const discLinkService = require('../services/discLinkService');

/**
 * Controller para lidar com a submissão e cálculo do teste DISC.
 */
const calcularTeste = (req, res) => {
  try {
    const { respostas } = req.body;

    // Validação básica
    if (!respostas || !Array.isArray(respostas) || respostas.length === 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O array de respostas é obrigatório e não pode estar vazio.'
      });
    }

    // Calcula os resultados usando o serviço
    const resultado = calcularDISC(respostas);

    return res.status(200).json({
      sucesso: true,
      data: resultado
    });
  } catch (error) {
    console.error('Erro ao calcular DISC:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Ocorreu um erro interno no servidor ao calcular o DISC.',
      erro: error.message
    });
  }
};

const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Controller para gerar token/link para o teste DISC
 */
const generateLink = async (req, res) => {
  try {
    const { isEmployee, companyId, branchId } = req.body;

    if (!companyId || !branchId) {
      return res.status(400).json({ sucesso: false, mensagem: 'companyId e branchId são obrigatórios.' });
    }

    const discLink = await discLinkService.criarLink({
      isEmployee: Boolean(isEmployee),
      companyId,
      branchId
    });

    return res.status(201).json({
      sucesso: true,
      token: discLink.id,
      link: `http://localhost:5173/disc/responder/${discLink.id}`
    });
  } catch (error) {
    console.error('Erro ao gerar token DISC:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Ocorreu um erro interno ao gerar o link do DISC.',
      erro: error.message
    });
  }
};

/**
 * Endpoint pré-validação: Obtém as configs do link sem expor IDs no frontend (e checa se é CPF ou Nome)
 */
const validateLink = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(404).send();
    }

    // Utiliza a nova Máquina de Estados (Que inativa se expirado e evolui para PROGRESS se estiver PENDING)
    const discLink = await discLinkService.validarAcessoLink(token);

    return res.status(200).json({
      sucesso: true,
      dados: {
        isEmployee: discLink.isEmployee,
        status: discLink.status
      }
    });

  } catch (error) {
    console.error('Erro na validação do link:', error);
    return res.status(404).send();
  }
};

/**
 * Endpoint para Finalizar o Link após o término do teste.
 * Altera status para CONCLUDED.
 */
const concluirTeste = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ sucesso: false, mensagem: 'Token não informado.' });

    await discLinkService.finalizarLink(token);

    return res.status(200).json({ sucesso: true, mensagem: 'Link finalizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao finalizar o link:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao finalizar link.', erro: error.message });
  }
};

module.exports = {
  calcularTeste,
  generateLink,
  validateLink,
  concluirTeste
};
