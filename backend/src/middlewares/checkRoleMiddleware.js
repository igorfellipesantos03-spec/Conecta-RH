const JWT_SECRET = process.env.JWT_SECRET || 'conectarh_super_secret_key_123';
const jwt = require('jsonwebtoken');

/**
 * Middleware de verificação de roles (RBAC).
 * Uso: checkRole('ADMIN', 'RH') — bloqueia qualquer role não listada com 403.
 *
 * Deve ser usado DEPOIS do authMiddleware, pois depende de req.user estar populado.
 *
 * @param {...string} allowedRoles - Roles que têm acesso à rota
 */
function checkRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: `Acesso negado. Esta ação exige um dos seguintes perfis: ${allowedRoles.join(', ')}.`,
        seuPerfil: userRole
      });
    }

    next();
  };
}

module.exports = checkRole;
