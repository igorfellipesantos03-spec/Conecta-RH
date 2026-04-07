const express = require('express');
const { verifyToken } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRoleMiddleware');
const {
  calcularTeste,
  generateLink,
  listarLinks,
  validateLink,
  iniciarTeste,
  concluirTeste,
  getMeuDisc,
  vincularCpf
} = require('../controllers/discController');

const router = express.Router();

// ─── Rotas Autenticadas (HUB interno) ────────────────────────────────────────

// GET  /api/disc/links — Lista os links para o DiscHub (filtrado por empresa/filial do usuário)
router.get('/links', verifyToken, checkRole('ADMIN', 'RH', 'GESTOR'), listarLinks);

// POST /api/disc/generate-link — Gera novo link/token DISC (apenas ADMIN e RH)
router.post('/generate-link', verifyToken, checkRole('ADMIN', 'RH'), generateLink);

// GET  /api/disc/meu-disc — Retorna o resultado DISC do próprio usuário logado
router.get('/meu-disc', verifyToken, getMeuDisc);

// POST /api/disc/vincular-cpf — Vincula o CPF digitado ao perfil do usuário no banco
router.post('/vincular-cpf', verifyToken, vincularCpf);

// ─── Rotas Públicas (tela do candidato/colaborador) ──────────────────────────

// GET  /api/disc/link/:token         → Valida o link (verifica se está ativo/expirado)
router.get('/link/:token', validateLink);

// POST /api/disc/link/:token/iniciar → Salva nome/CPF e avança status para PROGRESS
router.post('/link/:token/iniciar', iniciarTeste);

// POST /api/disc/link/:token/finalizar → Salva respostas+resultado e avança para CONCLUDED
router.post('/link/:token/finalizar', concluirTeste);

// POST /api/disc/calcular → Calcula perfil DISC sem persistir (uso avulso)
router.post('/calcular', calcularTeste);

module.exports = router;
