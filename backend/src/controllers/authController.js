const { buscarFuncionarioPorNome, getProtheusTokenDynamic } = require('../services/protheusService');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'conectarh_super_secret_key_123';

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username e senha são obrigatórios.' });
  }

  try {
    const normalizedUsername = username.toLowerCase().trim();

    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { username: normalizedUsername }
      });
    } catch (e) {
      console.warn('Prisma client fallback acionado:', e.message);
      const { Pool } = require('pg');
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [normalizedUsername]);
      user = result.rows[0];
      await pool.end();
    }

    if (!user || !user.active) {
      return res.status(403).json({
        error: 'Acesso Negado: Seu usuário não tem permissão para acessar o sistema ou está inativo.'
      });
    }

    // 2. Tentar autenticação na API do TOTVS Protheus usando as credenciais passadas
    let protheusData;
    try {
      protheusData = await getProtheusTokenDynamic(username, password);
    } catch (err) {
      // Retorna 401 se falhar (credenciais TOTVS incorretas)
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    const protheusAccessToken = protheusData.access_token;

    // 3. Buscar nome oficial no Protheus para o Dashboard (Fallback para nome formatado)
    let officialName = normalizedUsername.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

    try {
      const fData = await buscarFuncionarioPorNome(officialName);
      const items = fData?.items || fData;
      if (items && items.length > 0) {
        const rawName = items[0].name.toLowerCase();
        officialName = rawName.split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      }
    } catch (err) {
      console.log('Erro ao buscar nome oficial no Protheus, usando fallback.', err.message);
    }

    // 4. Determina o Perfil (Role) com base no banco
    const userRole = user.role;

    // 5. Gera JWT Customizado para a Sessão
    const sessionPayload = {
      username: normalizedUsername,
      name: officialName,
      role: userRole,
      protheusToken: protheusAccessToken
    };

    const token = jwt.sign(sessionPayload, JWT_SECRET, { expiresIn: '0.5h' });

    // 6. Sucesso: Repassar Somente o JWT Customizado
    return res.status(200).json({
      success: true,
      access_token: token,
      user: {
        username: normalizedUsername,
        name: officialName,
        role: userRole
      }
    });

  } catch (error) {
    console.error('Erro no AuthController:', error);
    return res.status(500).json({ error: 'Erro interno no servidor de autenticação.' });
  }
};
