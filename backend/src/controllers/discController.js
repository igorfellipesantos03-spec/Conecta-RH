/* eslint-disable no-unused-vars */
const prisma = require('../lib/prisma');
const { calcularDISC } = require('../services/discCalculator');
const discLinkService = require('../services/discLinkService');

/**
 * Controller para lidar com a submissão e cálculo do teste DISC (sem persistência).
 */
const calcularTeste = (req, res) => {
  try {
    const { respostas } = req.body;
    if (!respostas || !Array.isArray(respostas) || respostas.length === 0) {
      return res.status(400).json({ sucesso: false, mensagem: 'O array de respostas é obrigatório.' });
    }
    const resultado = calcularDISC(respostas);
    return res.status(200).json({ sucesso: true, data: resultado });
  } catch (error) {
    console.error('Erro ao calcular DISC:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao calcular DISC.', erro: error.message });
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
    const discLink = await discLinkService.criarLink({ isEmployee, companyId, branchId });
    return res.status(201).json({
      sucesso: true,
      token: discLink.id,
      link: `${process.env.FRONTEND_URL || 'https://conectarh.conasa.com'}/disc/responder/${discLink.id}`
    });
  } catch (error) {
    console.error('Erro ao gerar token DISC:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao gerar o link.', erro: error.message });
  }
};

/**
 * Retorna todos os links DISC gerados.
 */
const listarLinks = async (req, res) => {
  try {
    const { role, empresaId, filialId, username } = req.user;
    const links = await discLinkService.listarLinks(role, empresaId, filialId, username);
    return res.status(200).json({ sucesso: true, data: links });
  } catch (error) {
    console.error('Erro ao listar links:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar links.', erro: error.message });
  }
};

/**
 * Validação do link.
 */
const validateLink = async (req, res) => {
  try {
    const { token } = req.params;
    const discLink = await discLinkService.validarAcessoLink(token);
    return res.status(200).json({ sucesso: true, dados: { isEmployee: discLink.isEmployee, status: discLink.status } });
  } catch (error) {
    const statusCode = error.message.includes('expirado') ? 410 : 404;
    return res.status(statusCode).json({ sucesso: false, mensagem: error.message });
  }
};

/**
 * Registra nome e CPF.
 */
const iniciarTeste = async (req, res) => {
  try {
    const { token } = req.params;
    const { nome, cpf } = req.body;
    if (!nome || !cpf) {
      return res.status(400).json({ sucesso: false, mensagem: 'Nome e CPF são obrigatórios.' });
    }
    const discLink = await discLinkService.iniciarTeste(token, nome, cpf);
    return res.status(200).json({ sucesso: true, dados: { status: discLink.status } });
  } catch (error) {
    return res.status(500).json({ sucesso: false, mensagem: error.message });
  }
};

/**
 * Finaliza o teste.
 */
const concluirTeste = async (req, res) => {
  try {
    const { token } = req.params;
    const { respostas, resultado, departamentCode, costCenterCode } = req.body;
    await discLinkService.finalizarLink(token, respostas, resultado, departamentCode, costCenterCode);
    return res.status(200).json({ sucesso: true, mensagem: 'Teste concluído.' });
  } catch (error) {
    return res.status(500).json({ sucesso: false, mensagem: error.message });
  }
};

/**
 * Visualizar próprio DISC.
 */
const getMeuDisc = async (req, res) => {
  try {
    const dbUser = await prisma.user.findUnique({
      where: { username: req.user.username }
    });

    if (!dbUser || !dbUser.cpf) {
      return res.status(400).json({ sucesso: false, mensagem: 'CPF não cadastrado.' });
    }

    const link = await discLinkService.obterLinkPorCpf(dbUser.cpf);
    if (!link) {
      return res.status(404).json({ sucesso: false, mensagem: 'DISC não encontrado.' });
    }

    return res.status(200).json({ sucesso: true, data: link });
  } catch (error) {
    return res.status(500).json({ sucesso: false, mensagem: error.message });
  }
};

/**
 * Vincular CPF.
 */
const vincularCpf = async (req, res) => {
  try {
    const { cpf } = req.body;
    if (!cpf) return res.status(400).json({ sucesso: false, mensagem: 'CPF obrigatório.' });
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) return res.status(400).json({ sucesso: false, mensagem: 'CPF inválido.' });
    const updated = await prisma.user.update({
      where: { username: req.user.username },
      data: { cpf: cpfLimpo }
    });
    return res.status(200).json({ sucesso: true, data: updated });
  } catch (error) {
    return res.status(500).json({ sucesso: false, mensagem: error.message });
  }
};

module.exports = {
  calcularTeste,
  generateLink,
  listarLinks,
  validateLink,
  iniciarTeste,
  concluirTeste,
  getMeuDisc,
  vincularCpf,
};
