const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRoleMiddleware');
const {
  calcularTeste,
  generateLink,
  listarLinks,
  validateLink,
  iniciarTeste,
  concluirTeste
} = require('../controllers/discController');

const router = express.Router();

// ─── Rotas Autenticadas (HUB interno) ────────────────────────────────────────

// GET  /api/disc/links — Lista os links para o DiscHub (filtrado por empresa/filial do usuário)
router.get('/links', authMiddleware, checkRole('ADMIN', 'RH'), listarLinks);

// POST /api/disc/generate-link — Gera novo link/token DISC (apenas ADMIN e RH)
router.post('/generate-link', authMiddleware, checkRole('ADMIN', 'RH'), generateLink);

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
