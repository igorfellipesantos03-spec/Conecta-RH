const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { buscarFuncionarios } = require('./services/protheusService');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de status do servidor
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    projeto: 'ConectaRH',
    versao: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Import Routes
const discRoutes = require('./routes/discRoutes');
const authRoutes = require('./routes/authRoutes');

// Rotas da API
app.use('/api/disc', discRoutes);
app.use('/api/auth', authRoutes);

// Rotas de Employees
const { checkCpf } = require('./controllers/employeeController');
app.get('/api/employees/check-cpf/:cpf', checkCpf);

// Rota de busca de funcionários — GET /api/funcionarios?busca=nome
app.get('/api/funcionarios', async (req, res) => {
  try {
    const { busca } = req.query;

    if (!busca || busca.trim().length === 0) {
      return res.json({ sucesso: true, dados: [] });
    }

    const dados = await buscarFuncionarios(busca.trim());
    res.json({ sucesso: true, dados });
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error.message);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar dados do Protheus.',
      erro: error.response?.data || error.message,
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor ConectaRH rodando na porta ${PORT}`);
  console.log(`📡 Status: http://localhost:${PORT}/api/status`);
  console.log(`🔍 Funcionários: http://localhost:${PORT}/api/funcionarios?busca=NOME`);
});
