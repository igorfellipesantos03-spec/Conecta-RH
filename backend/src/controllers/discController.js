const { calcularDISC } = require('../services/discCalculator');

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

    const discLink = await prisma.discLink.create({
      data: {
        isEmployee: Boolean(isEmployee),
        companyId,
        branchId,
        status: 'PENDING'
      }
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
      return res.status(400).json({ sucesso: false, mensagem: 'O token é obrigatório.' });
    }

    const discLink = await prisma.discLink.findUnique({
      where: { id: token }
    });

    if (!discLink) {
      return res.status(404).json({ sucesso: false, mensagem: 'Este link de teste é inválido ou não existe.' });
    }

    return res.status(200).json({
      sucesso: true,
      dados: {
        isEmployee: discLink.isEmployee,
        status: discLink.status
      }
    });

  } catch (error) {
    console.error('Erro na validação do link:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao processar validação.' });
  }
};

module.exports = {
  calcularTeste,
  generateLink,
  validateLink
};
