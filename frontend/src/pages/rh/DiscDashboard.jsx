import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// ──────────────────────────────────────────────
// Lista de Empresas (referência visual)
// ──────────────────────────────────────────────
const empresasList = [
  { id: '07', label: 'Conasa Infraestrutura' },
  { id: '23', label: 'Águas de Itapema' },
  { id: '24', label: 'Águas de Santo Antônio' },
  { id: '25', label: 'Sanesul' },
  { id: '26', label: 'Luz de Belém' },
  { id: '27', label: 'Sanesalto' },
  { id: '28', label: 'Sanetrat' },
  { id: '29', label: 'Conasa SPE' },
  { id: '31', label: 'Urbeluz S.A.' },
  { id: '32', label: 'Alegrete RJ' },
  { id: '33', label: 'Caraguá Luz' },
  { id: '35', label: 'Sanema' },
  { id: '36', label: 'ASB' },
  { id: '37', label: 'MT100' },
  { id: '38', label: 'Urbeluz SCP Campos' },
  { id: '39', label: 'Marabá Luz' },
  { id: '40', label: 'MT320' },
  { id: '42', label: 'MT246' },
  { id: '43', label: 'BR163' },
  { id: '44', label: 'Águas do Sertão' }
];

// ──────────────────────────────────────────────
// COMPONENTE: DiscDashboard
// ──────────────────────────────────────────────
export default function DiscDashboard() {
  const navigate = useNavigate();

  // Info do usuário logado
  const [userInfo, setUserInfo] = useState({ empresaId: '', filialId: '', name: '' });

  // Estado da busca
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  // Carrega info do usuário do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('@ConectaRH:user');
      if (stored) {
        const user = JSON.parse(stored);
        setUserInfo({
          empresaId: user.empresaId || '',
          filialId: user.filialId || '',
          name: user.name || user.username || ''
        });
      }
    } catch (e) { /* ignore */ }
  }, []);

  // Descobre o nome da empresa
  const empresaNome = empresasList.find(e => e.id === userInfo.empresaId)?.label || `Empresa ${userInfo.empresaId}`;

  // Busca com debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!busca.trim()) {
      setResultados([]);
      setError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        // Não envia companyId/branchId — o backend extrai do JWT
        const response = await api.get('/funcionarios?busca=' + encodeURIComponent(busca.trim()));
        if (response.data.sucesso) {
          const items = response.data.dados?.items || response.data.dados || [];
          setResultados(Array.isArray(items) ? items : []);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Sessão expirada. Faça login novamente.');
        } else {
          setError('Erro ao buscar funcionários. Verifique a conexão.');
        }
        console.error('Erro na busca:', err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [busca]);

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10">
      {/* Botão Voltar */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar para o Hub
      </button>

      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
          Busca de Funcionários — DISC
        </h1>
        <p className="text-gray-400 text-sm">
          Pesquise funcionários da sua empresa para visualizar ou gerar avaliações DISC.
        </p>
      </div>

      {/* Card de contexto empresarial */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 mb-8 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-600/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <p className="text-white font-medium text-sm">{empresaNome}</p>
          <p className="text-gray-500 text-xs">
            Empresa {userInfo.empresaId} · Filial {userInfo.filialId}
          </p>
        </div>
      </div>

      {/* Barra de busca */}
      <div className="relative mb-8">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          placeholder="Digite o nome do funcionário para pesquisar..."
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <svg className="w-5 h-5 text-gray-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </div>
        )}
      </div>

      {/* Erro */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Resultados */}
      {resultados.length > 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
            <h3 className="font-medium text-gray-200 text-sm">Funcionários Encontrados</h3>
            <span className="text-xs text-gray-500 font-mono">{resultados.length} resultado(s)</span>
          </div>

          <div className="divide-y divide-gray-800/60">
            {resultados.map((func, idx) => (
              <div
                key={func.code || func.id || idx}
                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-800/40 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-gray-400">
                      {(func.name || '?')[0].toUpperCase()}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm truncate">{func.name || 'Nome não informado'}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {func.code && (
                        <span className="text-gray-500 text-xs font-mono">Matrícula: {func.code}</span>
                      )}
                      {func.cpf && (
                        <span className="text-gray-500 text-xs font-mono">CPF: {func.cpf}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Badge empresa */}
                <span className="text-xs text-gray-500 bg-gray-800 rounded-full px-3 py-1 flex-shrink-0 border border-gray-700">
                  {func.companyKey || userInfo.empresaId} / {func.branch || userInfo.filialId}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : busca.trim() && !loading && !error ? (
        <div className="text-center py-16 text-gray-600">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <p className="text-gray-500 text-sm">Nenhum funcionário encontrado para "{busca}".</p>
          <p className="text-gray-600 text-xs mt-1">Verifique o nome e tente novamente.</p>
        </div>
      ) : !busca.trim() ? (
        <div className="text-center py-16 text-gray-600">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-gray-500 text-sm">Digite um nome na barra de busca acima.</p>
          <p className="text-gray-600 text-xs mt-1">
            Os resultados mostrarão apenas funcionários da {empresaNome}.
          </p>
        </div>
      ) : null}
    </main>
  );
}
