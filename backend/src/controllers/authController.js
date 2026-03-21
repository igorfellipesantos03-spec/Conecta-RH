const { buscarFuncionarioPorNome } = require('../services/protheusService');

const tiUsers = [
  'alisson.pereira', 'bruno.lamounier', 'diorgny',
  'fernando.pereira', 'gabriel.sales', 'gabriel.viana', 'igor.fellipe',
  'victor.moraes'
];

const rhUsers = [
  'esther.cotta', 'bruno.costa', 'anderson.araujo', 'ketlen.santos',
  'kenny.bertolazo', 'daiane.cintra', 'eduardo.cardoso', 'luis.borgo',
  'yasmin.pelicaro'
];

const allowList = [...tiUsers, ...rhUsers];

/**
 * Realiza o login no Protheus e valida acesso na AllowList
 */
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username e senha são obrigatórios.' });
  }

  try {
    // 1. Tentar autenticação na API do TOTVS Protheus
    const protheusUrl = 'https://restauth.protheusteste.conasa.com/rest/api/oauth2/v1/token?grant_type=password';

    // Configura os cabeçalhos conforme requisitado
    const response = await fetch(protheusUrl, {
      method: 'POST',
      headers: {
        'username': username,
        'password': password
      }
    });

    if (!response.ok) {
      // Retorna 401 se falhar (401 do TOTVS ou outro erro auth-related)
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    const data = await response.json();

    // 2. Validação da Lista de Acesso VIP
    const normalizedUsername = username.toLowerCase().trim();
    if (!allowList.includes(normalizedUsername)) {
      return res.status(403).json({
        error: 'Acesso Negado: Seu usuário não tem permissão para acessar o sistema.'
      });
    }

    // 3. Buscar nome oficial no Protheus para o Dashboard (Fallback para nome formatado)
    let officialName = normalizedUsername.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    
    try {
      const protheusData = await buscarFuncionarioPorNome(officialName);
      const items = protheusData?.items || protheusData;
      if (items && items.length > 0) {
         // Converte "IGOR FELLIPE SANTOS" para Title Case
         const rawName = items[0].name.toLowerCase();
         officialName = rawName.split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      }
    } catch(err) {
      console.log('Erro ao buscar nome ofical no Protheus, usando fallback.', err.message);
    }

    // 4. Determina o Perfil (Role) com base no grupo
    const userRole = tiUsers.includes(normalizedUsername) ? 'Tecnologia da Informação' : 'Recursos Humanos';

    // 5. Sucesso: Repassar Tokens e Contexto do Usuário
    return res.status(200).json({
      success: true,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
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
