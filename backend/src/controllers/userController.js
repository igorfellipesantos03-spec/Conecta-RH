const prisma = require('../lib/prisma');
const crypto = require('crypto');
const { Pool } = require('pg');

/**
 * Lista de empresas da holding — utilizada para validação no backend.
 */
const EMPRESAS_VALIDAS = [
  '07','23','24','25','26','27','28','29','31','32','33','35','36','37','38','39','40','42','43','44'
];

/**
 * Lista todos os usuários cadastrados no sistema.
 * Apenas ADMIN pode acessar esta rota (protegida via checkRole no userRoutes).
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        departamentCode: true,
        empresaId: true,
        filialId: true,
        active: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    try {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const result = await pool.query(
        'SELECT id, username, role, departament_code as "departamentCode", empresa_id as "empresaId", filial_id as "filialId", active, created_at as "createdAt" FROM users ORDER BY created_at DESC'
      );
      await pool.end();
      return res.status(200).json({ success: true, data: result.rows });
    } catch (pgError) {
      return res.status(500).json({ error: 'Erro interno ao listar usuários.', details: pgError.message });
    }
  }
};

/**
 * Cria (ou atualiza) um usuário no banco para dar acesso ao ConectaRH.
 * Agora empresaId e filialId são obrigatórios.
 */
exports.createUser = async (req, res) => {
  try {
    const { username, role = 'RH', departamentCode, empresaId, filialId } = req.body;

    if (!username || username.trim() === '') {
      return res.status(400).json({ error: 'O campo de usuário é obrigatório.' });
    }

    const validRoles = ['ADMIN', 'RH'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Role inválida. Valores aceitos: ${validRoles.join(', ')}.` });
    }

    // Empresa é obrigatória
    if (!empresaId || !empresaId.trim()) {
      return res.status(400).json({ error: 'A Empresa é obrigatória.' });
    }
    const isFlexBranch = empresaId.trim() === '31' || empresaId.trim() === '43';
    if (!isFlexBranch && (!filialId || !filialId.trim())) {
      return res.status(400).json({ error: 'A Filial é obrigatória para esta empresa.' });
    }

    if (!EMPRESAS_VALIDAS.includes(empresaId.trim())) {
      return res.status(400).json({ error: `Empresa "${empresaId}" não reconhecida.` });
    }

    const normalizedUsername = username.toLowerCase().trim();

    // 1. Verifica se já existe
    let isExisting = false;
    try {
      const existingUser = await prisma.user.findUnique({ where: { username: normalizedUsername } });
      if (existingUser) isExisting = true;
    } catch (e) {
      console.warn('Prisma findUnique fallback acionado no createUser:', e.message);
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [normalizedUsername]);
      if (result.rows.length > 0) isExisting = true;
      await pool.end();
    }

    if (isExisting) {
      return res.status(400).json({ error: 'Este usuário já está cadastrado no sistema.' });
    }

    // 2. Cria o usuário
    let newUser = null;
    const finalDeptCode = departamentCode?.trim() || null;
    const finalEmpresaId = empresaId.trim();
    const finalFilialId = filialId ? filialId.trim() : null;

    try {
      newUser = await prisma.user.create({
        data: {
          username: normalizedUsername,
          role,
          departamentCode: finalDeptCode,
          empresaId: finalEmpresaId,
          filialId: finalFilialId,
          active: true
        }
      });
    } catch (e) {
      console.warn('Prisma create fallback acionado no createUser:', e.message);
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const id = crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2) + Date.now().toString(36));
      const now = new Date();
      await pool.query(
        'INSERT INTO users (id, username, role, departament_code, empresa_id, filial_id, active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [id, normalizedUsername, role, finalDeptCode, finalEmpresaId, finalFilialId, true, now, now]
      );
      newUser = { username: normalizedUsername, role, departamentCode: finalDeptCode, empresaId: finalEmpresaId, filialId: finalFilialId };
      await pool.end();
    }

    return res.status(201).json({
      success: true,
      message: 'Acesso liberado com sucesso!',
      user: {
        username: newUser.username,
        role: newUser.role,
        departamentCode: newUser.departamentCode,
        empresaId: newUser.empresaId,
        filialId: newUser.filialId
      }
    });

  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    return res.status(500).json({ error: 'Erro interno ao adicionar o usuário.', details: error.message });
  }
};

/**
 * Atualiza dados de um usuário.
 */
exports.updateUser = async (req, res) => {
  try {
    const { username } = req.params;
    const { role, departamentCode, empresaId, filialId, active } = req.body;

    const validRoles = ['ADMIN', 'RH'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: `Role inválida.` });
    }

    if (empresaId && !EMPRESAS_VALIDAS.includes(empresaId.trim())) {
      return res.status(400).json({ error: `Empresa "${empresaId}" não reconhecida.` });
    }

    let updated = null;
    try {
      updated = await prisma.user.update({
        where: { username: username.toLowerCase() },
        data: {
          ...(role !== undefined ? { role } : {}),
          ...(departamentCode !== undefined ? { departamentCode: departamentCode || null } : {}),
          ...(empresaId !== undefined ? { empresaId: empresaId || null } : {}),
          ...(filialId !== undefined ? { filialId: filialId ? filialId.trim() : null } : {}),
          ...(active !== undefined ? { active } : {})
        },
        select: { username: true, role: true, departamentCode: true, empresaId: true, filialId: true, active: true }
      });
    } catch (e) {
      console.warn('Prisma update fallback acionado no updateUser:', e.message);
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      
      const updates = [];
      const values = [];
      let idx = 1;

      if (role !== undefined) { updates.push(`role = $${idx++}`); values.push(role); }
      if (departamentCode !== undefined) { updates.push(`departament_code = $${idx++}`); values.push(departamentCode || null); }
      if (empresaId !== undefined) { updates.push(`empresa_id = $${idx++}`); values.push(empresaId || null); }
      if (filialId !== undefined) { updates.push(`filial_id = $${idx++}`); values.push(filialId ? filialId.trim() : null); }
      if (active !== undefined) { updates.push(`active = $${idx++}`); values.push(active); }

      if (updates.length > 0) {
        values.push(username.toLowerCase());
        const query = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE username = $${idx} RETURNING username, role, departament_code as "departamentCode", empresa_id as "empresaId", filial_id as "filialId", active`;
        const result = await pool.query(query, values);
        if (result.rows.length > 0) updated = result.rows[0];
      }
      await pool.end();
    }

    return res.status(200).json({ success: true, user: updated });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar o usuário.', details: error.message });
  }
};

/**
 * Remove (desativa) um usuário pelo username.
 */
exports.deleteUser = async (req, res) => {
  try {
    const { username } = req.params;

    try {
      await prisma.user.update({
        where: { username: username.toLowerCase() },
        data: { active: false }
      });
    } catch (e) {
      console.warn('Prisma delete fallback acionado no deleteUser:', e.message);
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      await pool.query("UPDATE users SET active = false WHERE username = $1", [username.toLowerCase()]);
      await pool.end();
    }

    return res.status(200).json({ success: true, message: 'Usuário desativado com sucesso.' });
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    return res.status(500).json({ error: 'Erro ao desativar usuário.', details: error.message });
  }
};
