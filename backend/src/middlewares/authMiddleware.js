const jwt = require('jsonwebtoken');
const sessionStore = require('../lib/sessionStore');

const JWT_SECRET = process.env.JWT_SECRET || 'conectarh_super_secret_key_123';

/**
 * Middleware para validar o JWT em rotas protegidas.
 *
 * Após decodificar o JWT, recupera o token Protheus do sessionStore
 * (armazenado no login). Se o token Protheus não existir mais no store
 * (expirou), retorna 401 pedindo re-login.
 */
function authMiddleware(req, res, next) {
  let token;
  if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido ou formato inválido.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Injeta os dados do usuário no request
    req.user = {
      username: decoded.username,
      role: decoded.role,
      name: decoded.name,
      departamentCode: decoded.departamentCode || null,
      empresaId: decoded.empresaId || null,
      filialId: decoded.filialId || null
    };

    // Recupera o token Protheus do sessionStore (armazenado no login)
    const protheusToken = sessionStore.get(decoded.username);
    if (!protheusToken) {
      return res.status(401).json({
        error: 'Sessão Protheus expirada. Por favor, faça login novamente.'
      });
    }
    req.protheusToken = protheusToken;

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado. Por favor, faça login novamente.' });
    }
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

/**
 * Versão simplificada do authMiddleware que valida apenas o JWT,
 * sem exigir a sessão Protheus. Usada em rotas que não precisam
 * acessar o Protheus (ex: /api/access).
 */
function verifyToken(req, res, next) {
  let token;
  if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido ou formato inválido.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      username: decoded.username,
      role: decoded.role,
      name: decoded.name,
      departamentCode: decoded.departamentCode || null,
      empresaId: decoded.empresaId || null,
      filialId: decoded.filialId || null
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado. Por favor, faça login novamente.' });
    }
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

module.exports = authMiddleware;
module.exports.verifyToken = verifyToken;
