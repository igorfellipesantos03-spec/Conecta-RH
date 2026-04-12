const express = require('express');
const router = express.Router();
const accessController = require('../controllers/accessController');
const { verifyToken } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRoleMiddleware');

// Rotas de Colaborador (Qualquer usuário logado)
router.post('/request', verifyToken, accessController.createRequest);

// Departamentos disponíveis (para o modal de solicitação)
router.get('/departments', verifyToken, accessController.getDepartments);
// Alias retrocompatível — deprecated, usar /departments
router.get('/cost-centers', verifyToken, accessController.getDepartments);

// Rotas de RH / Admin
router.get('/requests', verifyToken, checkRole('ADMIN', 'RH'), accessController.getRequests);
router.post('/requests/:id/approve', verifyToken, checkRole('ADMIN', 'RH'), accessController.approveRequest);
router.post('/requests/:id/reject', verifyToken, checkRole('ADMIN', 'RH'), accessController.rejectRequest);

module.exports = router;
