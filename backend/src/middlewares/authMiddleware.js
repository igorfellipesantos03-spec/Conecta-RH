const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'conectarh_super_secret_key_123';

/**
 * Middleware para validar o JWT em rotas protegidas
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido ou formato inválido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Injeta os dados do usuário e o token do Protheus no request
    req.user = {
      username: decoded.username,
      role: decoded.role,
      name: decoded.name
    };
    req.protheusToken = decoded.protheusToken;

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado. Por favor, faça login novamente.' });
    }
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

module.exports = authMiddleware;
