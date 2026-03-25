const prisma = require('../lib/prisma');
const crypto = require('crypto');
const { Pool } = require('pg');

exports.createUser = async (req, res) => {
  try {
    const { username, departamento } = req.body;

    if (!username || username.trim() === '') {
      return res.status(400).json({ error: 'O campo de usuário é obrigatório.' });
    }

    if (!departamento || departamento.trim() === '') {
      return res.status(400).json({ error: 'O departamento é obrigatório.' });
    }

    const normalizedUsername = username.toLowerCase().trim();

    // 1. Verifica se já existe
    let isExisting = false;
    try {
      const existingUser = await prisma.user.findUnique({
        where: { username: normalizedUsername }
      });
      if (existingUser) isExisting = true;
    } catch (e) {
      console.warn('Prisma client findUnique fallback acionado:', e.message);
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
    try {
      newUser = await prisma.user.create({
        data: {
          username: normalizedUsername,
          role: departamento,
          active: true
        }
      });
    } catch (e) {
      console.warn('Prisma client create fallback acionado:', e.message);
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const id = crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2) + Date.now().toString(36));
      const now = new Date();
      await pool.query(
        'INSERT INTO users (id, username, role, active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [id, normalizedUsername, departamento, true, now, now]
      );
      newUser = { username: normalizedUsername, role: departamento };
      await pool.end();
    }

    return res.status(201).json({
      success: true,
      message: 'Acesso liberado com sucesso!',
      user: {
        username: newUser.username,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    return res.status(500).json({ error: 'Erro interno ao adicionar o usuário no banco de dados.', details: error.message });
  }
};
