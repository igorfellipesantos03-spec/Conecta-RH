const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { buscarFuncionarios } = require('./services/protheusService');

const app = express();

require('./services/cronJobs'); // Inicia as tarefas em segundo plano

const origensPermitidas = process.env.FRONTEND_URL || '*';

// Middlewares
app.use(cors({
  origin: origensPermitidas,
  credentials: true // Permite receber e enviar Cookies (HttpOnly)
}));
app.use(helmet()); // Headers de segurança OWASP
app.use(cookieParser()); // Parser para leitura de req.cookies
app.use(express.json());

// Limite Global de Requisições para evitar DDoS (500 por 15 min)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Muitas requisições, por favor tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Limite estrito para a rota de autenticação (evitar brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rota de status do servidor
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    projeto: 'ConectaRH',
    versao: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

const authMiddleware = require('./middlewares/authMiddleware');
const discRoutes = require('./routes/discRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const accessRoutes = require('./routes/accessRoutes');

app.use('/api/disc', discRoutes);
app.use('/api/auth', authLimiter, authRoutes); // Aplica limite estrito APENAS no login

app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/access', accessRoutes);

const { checkCpf } = require('./controllers/employeeController');
app.get('/api/employees/check-cpf/:cpf', checkCpf);

/**
 * Helper: Máscara LGPD para CPF.
 * Ex: "12345678901" → "***.456.789-**"
 * Recebe CPF com ou sem formatação, retorna mascarado formatado.
 */
function mascararCPF(cpf) {
  if (!cpf) return null;
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return '***.***.***-**';
  return `***.${digits.substring(3, 6)}.${digits.substring(6, 9)}-**`;
}

/**
 * GET /api/funcionarios
 * Busca funcionários no Protheus usando:
 * - Token Protheus do usuário logado (via sessionStore)
 * - Empresa e Filial do usuário logado (do JWT / banco)
 * Aplica máscara LGPD no CPF antes de enviar ao frontend.
 */
app.get('/api/funcionarios', authMiddleware, async (req, res) => {
  try {
    const { busca } = req.query;

    if (!busca || busca.trim().length === 0) {
      return res.json({ sucesso: true, dados: [] });
    }

    const protheusToken = req.protheusToken;
    const empresaId = req.user.empresaId;
    const filialId = req.user.filialId;

    if (!protheusToken) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Sessão Protheus expirada. Faça login novamente.'
      });
    }

    if (!empresaId || (!filialId && !['31', '43'].includes(empresaId))) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Empresa e Filial não configuradas para este usuário. Contate o administrador.'
      });
    }

    const dados = await buscarFuncionarios(protheusToken, busca.trim(), empresaId, filialId);

    // Aplica máscara de LGPD nos campos de CPF
    const items = dados?.items || dados;
    if (Array.isArray(items)) {
      items.forEach(func => {
        if (func.cpf) func.cpf = mascararCPF(func.cpf);
        if (func.RA_CIC) func.RA_CIC = mascararCPF(func.RA_CIC);
      });
    }

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
  console.log(`🔒 Aceitando requisições apenas de: ${origensPermitidas}`);
  console.log(`🔍 Funcionários: http://localhost:${PORT}/api/funcionarios?busca=NOME`);
});
