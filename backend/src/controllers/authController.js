const { getProtheusTokenDynamic } = require('../services/protheusService');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const sessionStore = require('../lib/sessionStore');

const JWT_SECRET = process.env.JWT_SECRET || 'conectarh_super_secret_key_123';

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username e senha são obrigatórios.' });
  }

  try {
    const normalizedUsername = username.toLowerCase().trim();

    // 1. Verifica se o usuário tem acesso ao ConectaRH (tabela users)
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
      // Mapeia snake_case para camelCase
      if (user) {
        user.empresaId = user.empresa_id;
        user.filialId = user.filial_id;
        user.departamentCode = user.departament_code;
      }
      await pool.end();
    }

    if (!user || !user.active) {
      return res.status(403).json({
        error: 'Acesso Negado: Seu usuário não tem permissão para acessar o sistema ou está inativo.'
      });
    }

    // 2. Autenticar no Protheus com as credenciais individuais do usuário
    let protheusData;
    try {
      protheusData = await getProtheusTokenDynamic(username, password);
    } catch (err) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    const protheusAccessToken = protheusData.access_token;

    // 3. SEGURANÇA: Armazenar o token Protheus SOMENTE no backend (SessionStore)
    //    O frontend NUNCA receberá este token.
    sessionStore.set(normalizedUsername, protheusAccessToken);

    // 4. Buscar nome oficial no Protheus para o Dashboard (Fallback para nome formatado)
    let officialName = normalizedUsername.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

    // Nota: busca de nome desabilitada temporariamente — usaria token do usuário
    // mas pode causar erro se o endpoint não estiver disponível.
    // O nome formatado do username é suficiente para a saudação no dashboard.

    // 5. Monta o payload do JWT do ConectaRH
    //    ATENÇÃO: NÃO incluir protheusToken aqui — ele fica só no sessionStore
    const userRole = user.role;
    const userDeptCode = user.departamentCode || null;
    const userEmpresaId = user.empresaId || null;
    const userFilialId = user.filialId || null;

    const sessionPayload = {
      username: normalizedUsername,
      name: officialName,
      role: userRole,
      departamentCode: userDeptCode,
      empresaId: userEmpresaId,
      filialId: userFilialId
      // protheusToken: NÃO incluído — armazenado apenas no sessionStore
    };

    const token = jwt.sign(sessionPayload, JWT_SECRET, { expiresIn: '15m' });

    // 6. Resposta: JWT próprio + dados públicos do usuário
    return res.status(200).json({
      success: true,
      access_token: token,
      user: {
        username: normalizedUsername,
        name: officialName,
        role: userRole,
        departamentCode: userDeptCode,
        empresaId: userEmpresaId,
        filialId: userFilialId
      }
    });

  } catch (error) {
    console.error('Erro no AuthController:', error);
    return res.status(500).json({ error: 'Erro interno no servidor de autenticação.' });
  }
};
