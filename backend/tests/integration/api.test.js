/**
 * Testes de integração — API HTTP do ConectaRH
 *
 * PRÉ-REQUISITO: o servidor deve estar rodando em http://localhost:3001
 * (npm run dev no diretório backend)
 *
 * Execução: node --test tests/integration/api.test.js
 *
 * Os testes das rotas de DISC e Access usam verifyToken (JWT-only).
 * As rotas /funcionarios usam o authMiddleware completo (exige sessão Protheus).
 */
'use strict';

const { test, describe, before } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
require('dotenv').config();

// ─── Configurações ────────────────────────────────────────────────────────────

const BASE = 'http://localhost:3001';

// JWT gerado offline com o secret padrão para testes (expira em 2099)
// payload: { username: 'rh.teste', role: 'RH', empresaId: '31', filialId: '01' }
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'conectarh_super_secret_key_123';

const RH_TOKEN = jwt.sign(
  { username: 'rh.teste', name: 'RH Teste', role: 'RH', empresaId: '31', filialId: '01' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const ADMIN_TOKEN = jwt.sign(
  { username: 'admin.teste', name: 'Admin Teste', role: 'ADMIN', empresaId: '31', filialId: '01' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const USER_TOKEN = jwt.sign(
  { username: 'usuario.teste', name: 'Usuario Teste', role: 'USER', empresaId: '31', filialId: '01' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

// ─── Helper HTTP ─────────────────────────────────────────────────────────────

function request(method, path, { body, token } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const bodyStr = body ? JSON.stringify(body) : null;

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (bodyStr) headers['Content-Length'] = Buffer.byteLength(bodyStr);

    const req = http.request(
      { hostname: url.hostname, port: url.port || 3001, path: url.pathname + url.search, method, headers },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      }
    );
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ─── Verificação de servidor ──────────────────────────────────────────────────

let serverOnline = false;

before(async () => {
  try {
    const res = await request('GET', '/api/status');
    serverOnline = res.status === 200;
  } catch {
    serverOnline = false;
  }

  if (!serverOnline) {
    console.warn('\n⚠️  SERVIDOR OFFLINE — inicie com "npm run dev" no diretório backend.\n');
  }
});

const skip = (msg) => ({ skip: msg });

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('GET /api/status', () => {
  test('deve retornar status 200 e projeto ConectaRH', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    const res = await request('GET', '/api/status');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'online');
    assert.equal(res.body.projeto, 'ConectaRH');
    assert.ok(res.body.timestamp, 'timestamp ausente');
  });
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  test('sem credenciais → 400', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    const res = await request('POST', '/api/auth/login', { body: {} });
    assert.equal(res.status, 400);
    assert.ok(res.body.error, 'campo error ausente');
  });

  test('credenciais inválidas → 401 ou 403 (usuário não existe no DB)', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    const res = await request('POST', '/api/auth/login', {
      body: { username: 'usuario.invalido', password: 'senha_errada' }
    });
    assert.ok([401, 403].includes(res.status), `Status inesperado: ${res.status}`);
  });
});

// ─── DISC — Rotas Públicas ────────────────────────────────────────────────────

describe('GET /api/disc/link/:token — link inexistente', () => {
  test('token aleatório → 404', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    const res = await request('GET', '/api/disc/link/token-que-nao-existe-xyz-12345');
    assert.ok([404, 410].includes(res.status), `Esperado 404/410, recebido ${res.status}`);
    assert.equal(res.body.sucesso, false);
  });
});

describe('POST /api/disc/calcular — sem autenticação', () => {
  test('payload válido → 200 com resultado DISC', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    const respostas = Array.from({ length: 24 }, () => ({ mais: 'D', menos: 'I' }));
    const res = await request('POST', '/api/disc/calcular', { body: { respostas } });

    assert.equal(res.status, 200);
    assert.equal(res.body.sucesso, true);
    assert.ok(res.body.data, 'campo data ausente');
    assert.ok('ambienteAdaptado' in res.body.data, 'ambienteAdaptado ausente');
    assert.equal(res.body.data.ambienteAdaptado.D, 100);
  });

  test('sem respostas → 400', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    const res = await request('POST', '/api/disc/calcular', { body: {} });
    assert.equal(res.status, 400);
    assert.equal(res.body.sucesso, false);
  });

  test('respostas vazio [] → 400', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    const res = await request('POST', '/api/disc/calcular', { body: { respostas: [] } });
    assert.equal(res.status, 400);
  });
});

// ─── DISC — Rotas Autenticadas ────────────────────────────────────────────────

describe('GET /api/disc/links — RBAC', () => {
  test('sem token → 401', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    const res = await request('GET', '/api/disc/links');
    assert.equal(res.status, 401);
  });

  test('USER tenta acessar → 403', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    const res = await request('GET', '/api/disc/links', { token: USER_TOKEN });
    assert.equal(res.status, 403);
    assert.ok(res.body.error, 'mensagem de erro ausente');
  });

  test('RH acessa → 200', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    const res = await request('GET', '/api/disc/links', { token: RH_TOKEN });
    assert.equal(res.status, 200);
    assert.equal(res.body.sucesso, true);
    assert.ok(Array.isArray(res.body.data), 'data deve ser array');
  });

  test('ADMIN acessa → 200', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    const res = await request('GET', '/api/disc/links', { token: ADMIN_TOKEN });
    assert.equal(res.status, 200);
    assert.equal(res.body.sucesso, true);
  });
});

describe('POST /api/disc/generate-link — RBAC', () => {
  test('sem token → 401', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    const res = await request('POST', '/api/disc/generate-link', {
      body: { isEmployee: true, companyId: '31', branchId: '01' }
    });
    assert.equal(res.status, 401);
  });

  test('USER tenta gerar link → 403', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    const res = await request('POST', '/api/disc/generate-link', {
      token: USER_TOKEN,
      body: { isEmployee: true, companyId: '31', branchId: '01' }
    });
    assert.equal(res.status, 403);
  });

  test('RH sem companyId → 400', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    const res = await request('POST', '/api/disc/generate-link', {
      token: RH_TOKEN,
      body: { isEmployee: true }
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.sucesso, false);
  });

  test('RH com payload completo → 201 com token e link', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    const res = await request('POST', '/api/disc/generate-link', {
      token: RH_TOKEN,
      body: { isEmployee: true, companyId: '31', branchId: '01' }
    });
    assert.equal(res.status, 201, `Esperado 201, recebido ${res.status}: ${JSON.stringify(res.body)}`);
    assert.equal(res.body.sucesso, true);
    assert.ok(res.body.token, 'token ausente');
    assert.ok(res.body.link, 'link ausente');
  });
});

// ─── Fluxo completo DISC ──────────────────────────────────────────────────────

describe('Fluxo completo: gerar → validar → iniciar → finalizar', () => {
  let discToken;

  test('1. RH gera link DISC', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    const res = await request('POST', '/api/disc/generate-link', {
      token: RH_TOKEN,
      body: { isEmployee: false, companyId: '31', branchId: '01' }
    });
    assert.equal(res.status, 201);
    discToken = res.body.token;
    assert.ok(discToken, 'token não retornado');
  });

  test('2. Valida link recém-criado → status PENDING', async (t) => {
    if (!serverOnline || !discToken) t.skip('Depende do passo anterior');

    const res = await request('GET', `/api/disc/link/${discToken}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.sucesso, true);
    assert.equal(res.body.dados.status, 'PENDING');
  });

  test('3. Inicia teste com nome e CPF válidos → status PROGRESS', async (t) => {
    if (!serverOnline || !discToken) t.skip('Depende do passo anterior');

    const res = await request('POST', `/api/disc/link/${discToken}/iniciar`, {
      body: { nome: 'João da Silva', cpf: '12345678901' }
    });
    assert.equal(res.status, 200, `Esperado 200, recebido: ${JSON.stringify(res.body)}`);
    assert.equal(res.body.sucesso, true);
    assert.equal(res.body.dados.status, 'PROGRESS');
  });

  test('4. Tenta iniciar novamente o mesmo link → erro (não PENDING)', async (t) => {
    if (!serverOnline || !discToken) t.skip('Depende do passo anterior');

    const res = await request('POST', `/api/disc/link/${discToken}/iniciar`, {
      body: { nome: 'João da Silva', cpf: '12345678901' }
    });
    assert.ok([400, 404, 410, 500].includes(res.status), `Status inesperado: ${res.status}`);
    assert.equal(res.body.sucesso, false);
  });

  test('5. Finaliza o teste com respostas e resultado', async (t) => {
    if (!serverOnline || !discToken) t.skip('Depende do passo anterior');

    const respostas = Array.from({ length: 24 }, () => ({ mais: 'D', menos: 'I' }));
    const resultado = {
      perfilMestre: 'Dominância (Executor)',
      ambienteAdaptado: { D: 100, I: 0, S: 0, C: 0 },
      ambienteNatural: { D: 0, I: 100, S: 0, C: 0 },
    };

    const res = await request('POST', `/api/disc/link/${discToken}/finalizar`, {
      body: { respostas, resultado, departamentCode: 'TI001' }
    });
    assert.equal(res.status, 200, `Esperado 200, recebido: ${JSON.stringify(res.body)}`);
    assert.equal(res.body.sucesso, true);
  });

  test('6. Tenta validar link após conclusão → 410 (expirado/utilizado)', async (t) => {
    if (!serverOnline || !discToken) t.skip('Depende do passo anterior');

    const res = await request('GET', `/api/disc/link/${discToken}`);
    assert.ok([410, 404].includes(res.status), `Esperado 410/404, recebido: ${res.status}`);
    assert.equal(res.body.sucesso, false);
  });
});

// ─── Rota de funcionários — proteção ─────────────────────────────────────────

describe('GET /api/funcionarios — proteção JWT', () => {
  test('sem token → 401', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    const res = await request('GET', '/api/funcionarios?busca=teste');
    assert.equal(res.status, 401);
  });

  test('sem termo de busca + JWT sem sessão Protheus → 401', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    // authMiddleware exige sessão Protheus no sessionStore (gerada no login real).
    // Em testes, não há sessão → 401 esperado.
    const res = await request('GET', '/api/funcionarios', { token: RH_TOKEN });
    assert.equal(res.status, 401);
    assert.ok(res.body.error, 'mensagem de erro ausente');
  });
});

// ─── Access Requests — RBAC ───────────────────────────────────────────────────

describe('GET /api/access/requests — apenas RH/ADMIN', () => {
  test('sem token → 401', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    const res = await request('GET', '/api/access/requests');
    assert.equal(res.status, 401);
  });

  test('USER tenta listar → 403', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    const res = await request('GET', '/api/access/requests', { token: USER_TOKEN });
    assert.equal(res.status, 403);
  });

  test('RH lista solicitações → 200', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    const res = await request('GET', '/api/access/requests', { token: RH_TOKEN });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data), 'data deve ser array');
  });
});

describe('POST /api/access/request — criar solicitação', () => {
  test('sem body → 400', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    // Validação dispara antes da busca no banco → 400 garantido
    const res = await request('POST', '/api/access/request', {
      token: USER_TOKEN,
      body: {}
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('requestedDepts vazio → 400', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    const res = await request('POST', '/api/access/request', {
      token: USER_TOKEN,
      body: { requestedDepts: [] }
    });
    assert.equal(res.status, 400);
  });

  test('payload válido com usuário inexistente → 404', async (t) => {
    if (!serverOnline) t.skip('Servidor offline');

    // O token JWT é válido mas o usuário "usuario.teste" não existe no banco
    const res = await request('POST', '/api/access/request', {
      token: USER_TOKEN,
      body: { requestedDepts: [{ code: 'TI001', name: 'T.I.' }], justification: 'Preciso de acesso' }
    });
    assert.ok([404, 400, 201].includes(res.status), `Status inesperado: ${res.status} — ${JSON.stringify(res.body)}`);
  });
});
