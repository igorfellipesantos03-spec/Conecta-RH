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

    // 1. Autenticar no Protheus — se falhar, continua sem token (login local)
    let protheusAccessToken = null;
    try {
      const protheusData = await getProtheusTokenDynamic(username, password);
      protheusAccessToken = protheusData.access_token;
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
      }
      console.warn('Protheus indisponível, prosseguindo sem token:', err.message);
    }

    // protheusAccessToken already set from earlier block

    // 2. JIT: Busca ou cria o usuário no banco (auto-cadastro)
    let user;
    try {
      // Primeiro tenta obter o CPF do Protheus usando o token obtido no login
      const protheusService = require('../services/protheusService');
      let cpf = null;
      if (protheusAccessToken) {
        try {
          const funcionarios = await protheusService.buscarFuncionarios(protheusAccessToken, normalizedUsername, null, null);
          if (Array.isArray(funcionarios) && funcionarios.length > 0) {
            cpf = funcionarios[0].cpf || null;
          }
        } catch (e) {
          console.warn('Não foi possível buscar CPF no Protheus:', e.message);
        }
      }

      user = await prisma.user.upsert({
        where: { username: normalizedUsername },
        update: { ...(cpf && { cpf }) }, // Atualiza CPF caso tenha sido encontrado
        create: {
          username: normalizedUsername,
          role: 'USER',
          ...(cpf && { cpf })
          // empresaId, filialId ficam null — serão preenchidos depois
        }
      });
    } catch (e) {
      console.warn('Prisma upsert fallback:', e.message);
      // Fallback direto via pg se prisma falhar
      const { Pool } = require('pg');
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [normalizedUsername]);
      if (result.rows.length === 0) {
        await pool.query(
          "INSERT INTO users (id, username, role, created_at, updated_at) VALUES (gen_random_uuid(), $1, 'USER', NOW(), NOW())",
          [normalizedUsername]
        );
        const inserted = await pool.query('SELECT * FROM users WHERE username = $1', [normalizedUsername]);
        user = inserted.rows[0];
      } else {
        user = result.rows[0];
      }
      if (user) {
        user.empresaId = user.empresa_id;
        user.filialId = user.filial_id;
        user.departamentCode = user.departament_code;
      }
      await pool.end();
    }

    // 3. Se o usuário foi desativado pelo ADMIN, bloqueia
    if (user && user.active === false) {
      return res.status(403).json({
        error: 'Acesso Negado: Seu usuário foi desativado pelo administrador.'
      });
    }

    // 4. SEGURANÇA: Armazenar o token Protheus SOMENTE no backend (SessionStore)
    sessionStore.set(normalizedUsername, protheusAccessToken);

    // 5. Nome formatado a partir do username
    let officialName = user?.name || normalizedUsername.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

    // 6. Monta o payload do JWT do ConectaRH
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
    };

    const token = jwt.sign(sessionPayload, JWT_SECRET, { expiresIn: '15m' });

    // 7. Resposta: Seta o cookie HttpOnly e manda apenas os dados do usuário publicamente
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: false, // Alterar para true quando houver certificado SSL em ambiente homolog/prod
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutos
    });

    return res.status(200).json({
      success: true,
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

exports.logout = (req, res) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  });
  return res.status(200).json({ success: true, message: 'Logout concluído' });
};
