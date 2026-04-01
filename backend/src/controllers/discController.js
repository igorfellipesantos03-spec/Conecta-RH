const { calcularDISC } = require('../services/discCalculator');
const discLinkService = require('../services/discLinkService');

const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Controller para lidar com a submissão e cálculo do teste DISC (sem persistência).
 */
const calcularTeste = (req, res) => {
  try {
    const { respostas } = req.body;

    if (!respostas || !Array.isArray(respostas) || respostas.length === 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O array de respostas é obrigatório e não pode estar vazio.'
      });
    }

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

/**
 * Controller para gerar token/link para o teste DISC.
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
 * Retorna todos os links DISC gerados, ordenados pelo mais recente.
 * Filtra por empresa/filial do usuário logado (RH vê apenas sua empresa).
 * ADMIN vê todos.
 */
const listarLinks = async (req, res) => {
  try {
    const { role, empresaId, filialId } = req.user;
    const links = await discLinkService.listarLinks(role, empresaId, filialId);
    return res.status(200).json({ sucesso: true, data: links });
  } catch (error) {
    console.error('Erro ao listar links DISC:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao listar os links DISC.',
      erro: error.message
    });
  }
};

/**
 * Endpoint pré-validação: verifica se o link é válido e retorna suas configs.
 */
const validateLink = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(404).send();
    }

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
    if (error.message.includes('expirado')) {
      return res.status(410).json({ sucesso: false, mensagem: error.message });
    }
    return res.status(404).json({ sucesso: false, mensagem: 'Link inválido ou não encontrado.' });
  }
};

/**
 * Registra nome e CPF do respondente e avança o status do link para PROGRESS.
 * Chamado quando o candidato/colaborador clica em "Iniciar Teste".
 */
const iniciarTeste = async (req, res) => {
  try {
    const { token } = req.params;
    const { nome, cpf } = req.body;

    if (!token) {
      return res.status(400).json({ sucesso: false, mensagem: 'Token não informado.' });
    }

    if (!nome || nome.trim() === '') {
      return res.status(400).json({ sucesso: false, mensagem: 'O nome é obrigatório para iniciar o teste.' });
    }

    if (!cpf) {
      return res.status(400).json({ sucesso: false, mensagem: 'O CPF é obrigatório para iniciar o teste.' });
    }

    // limpeza extra de CPF feita também no service, mas validamos o tamanho aqui
    const cpfNumeros = cpf.replace(/\D/g, '');
    if (cpfNumeros.length !== 11) {
      return res.status(400).json({ sucesso: false, mensagem: 'CPF inválido. Informe os 11 dígitos.' });
    }

    const discLink = await discLinkService.iniciarTeste(token, nome.trim(), cpf);

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Teste iniciado com sucesso.',
      dados: {
        status: discLink.status
      }
    });
  } catch (error) {
    console.error('Erro ao iniciar teste DISC:', error);
    const statusCode = error.message.includes('não encontrado') ? 404
                     : error.message.includes('expirado')       ? 410
                     : 500;
    return res.status(statusCode).json({
      sucesso: false,
      mensagem: error.message,
      erro: error.message
    });
  }
};

/**
 * Finaliza o teste DISC: persiste respostas e resultado no banco e altera status para CONCLUDED.
 * Também salva o departamentCode do respondente para habilitar o filtro do GESTOR.
 */
const concluirTeste = async (req, res) => {
  try {
    const { token } = req.params;
    const { respostas, resultado, departamentCode } = req.body;

    if (!token) {
      return res.status(400).json({ sucesso: false, mensagem: 'Token não informado.' });
    }

    // departamentCode é opcional (candidatos externos podem não ter)
    await discLinkService.finalizarLink(token, respostas, resultado, departamentCode || null);

    return res.status(200).json({ sucesso: true, mensagem: 'Teste concluído e resultados salvos com sucesso.' });
  } catch (error) {
    console.error('Erro ao finalizar o link:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao finalizar link.',
      erro: error.message
    });
  }
};

module.exports = {
  calcularTeste,
  generateLink,
  listarLinks,
  validateLink,
  iniciarTeste,
  concluirTeste
};
