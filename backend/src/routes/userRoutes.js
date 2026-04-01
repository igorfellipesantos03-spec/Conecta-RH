const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRoleMiddleware');
const userController = require('../controllers/userController');

// Todas as rotas de usuário são restritas ao perfil ADMIN
router.use(authMiddleware, checkRole('ADMIN'));

// GET  /api/users       → Lista todos os usuários
router.get('/', userController.getUsers);

// POST /api/users       → Cria um novo usuário com role e departamentCode
router.post('/', userController.createUser);

// PUT  /api/users/:username → Atualiza role/departamentCode/active
router.put('/:username', userController.updateUser);

// DELETE /api/users/:username → Desativa o usuário
router.delete('/:username', userController.deleteUser);

module.exports = router;
