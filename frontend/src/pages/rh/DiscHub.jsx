import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import api from '../../services/api';
import { DiscResultContent, DiscProfileAnalysis, DISC_PROFILES } from '../../components/DiscResultView';
import ManagerRequestModal from '../../components/ManagerRequestModal';

// DISC_PROFILES moved to DiscResultView.jsx

// ──────────────────────────────────────────────
// HELPER: Badge de Status
// ──────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    PENDING:   { label: 'Pendente',    cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
    PROGRESS:  { label: 'Em Andamento',cls: 'bg-cyan-500/15   text-cyan-400   border-cyan-500/30'   },
    CONCLUDED: { label: 'Concluído',   cls: 'bg-green-500/15  text-green-400  border-green-500/30'  },
    EXPIRED:   { label: 'Expirado',    cls: 'bg-red-500/15    text-red-400    border-red-500/30'    },
  };
  const cfg = map[status] || map.EXPIRED;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ──────────────────────────────────────────────
// HELPER: Card de Status do Link
// ──────────────────────────────────────────────
function LinkCard({ link }) {
  const [copiado, setCopiado] = useState(false);

  const borderMap = {
    PENDING:   'border-l-yellow-500',
    PROGRESS:  'border-l-cyan-500',
    CONCLUDED: 'border-l-green-500',
    EXPIRED:   'border-l-red-500',
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleCopy = () => {
    const linkUrl = `${window.location.origin}/disc/responder/${link.id}`;
    navigator.clipboard.writeText(linkUrl);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className={`bg-gray-900 border border-gray-800 border-l-4 ${borderMap[link.status] || 'border-l-gray-600'} rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-800/60 transition-colors`}>
      <div className="flex-1 min-w-0">
        {/* Nome do funcionário (aparece quando PROGRESS ou CONCLUDED) */}
        {link.nome ? (
          <p className="text-white font-semibold text-base truncate mb-0.5">{link.nome}</p>
        ) : (
          <p className="text-gray-500 text-sm italic mb-0.5">Aguardando início do teste…</p>
        )}
        {link.cpf && (
          <p className="text-gray-500 text-xs font-mono mb-1">
            CPF: {'*'.repeat(9)}{link.cpf.slice(-2)}
          </p>
        )}
        <p className="text-gray-500 text-xs">
          {link.isEmployee ? '👤 Funcionário' : '🧩 Candidato Externo'}
          {link.companyId && ` · Empresa ${link.companyId}`}
          &nbsp;·&nbsp;Gerado em {formatDate(link.criadoEm)}
        </p>

        {/* Exibir o link pendente para cópia */}
        {link.status === 'PENDING' && (
          <div className="mt-4 flex items-center justify-between gap-3 bg-gray-950 border border-gray-800 rounded-lg p-2 max-w-lg">
            <span className="text-gray-400 text-xs font-mono truncate select-all flex-1" title={`${window.location.origin}/disc/responder/${link.id}`}>
              {window.location.origin}/disc/responder/{link.id.substring(0, 15)}...
            </span>
            <button
              onClick={handleCopy}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                copiado
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {copiado ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copiado
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar
                </>
              )}
            </button>
          </div>
        )}
      </div>
      <div className="flex-shrink-0">
        <StatusBadge status={link.status} />
      </div>
    </div>
  );
}

// DiscProfileAnalysis moved to DiscResultView.jsx

// ──────────────────────────────────────────────
// MODAL: Detalhe do DISC Concluído
// ──────────────────────────────────────────────

function DiscDetailModal({ link: initialLink, onClose }) {
  const [currentLink, setCurrentLink] = useState(initialLink);

  // Atualiza caso o modal seja aberto com um novo link
  useEffect(() => {
    setCurrentLink(initialLink);
  }, [initialLink]);

  if (!currentLink) return null;

  const link = currentLink;
  const historico = initialLink.historico || [initialLink];

  const formatDateShort = (iso) =>
    new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const resultado = link.resultado || {};
  const natural = resultado.natural || resultado.ambienteNatural || {};
  const adaptado = resultado.adaptado || resultado.ambienteAdaptado || {};


  const respostas = Array.isArray(link.respostas) ? link.respostas : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-10 px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl shadow-2xl">
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">{link.nome || 'Sem nome'}</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
              <p className="text-gray-400 text-sm">
                {link.cpf ? `CPF: ${'•'.repeat(9)}${link.cpf.slice(-2)}` : 'CPF não informado'}
                {link.isEmployee ? ' · Funcionário' : ' · Candidato'}
              </p>
              
              {/* Seletor de Histórico se houver mais de um teste */}
              {historico.length > 1 && (
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <span className="text-xs text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {historico.length} testes encontrados
                  </span>
                  <select
                    value={link.id}
                    onChange={(e) => setCurrentLink(historico.find(l => l.id === e.target.value))}
                    className="bg-gray-800 border border-gray-700 text-xs text-white rounded py-1 px-2 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    {historico.map((h, i) => (
                      <option key={h.id} value={h.id}>
                        {formatDateShort(h.criadoEm)} {i === 0 && '(Mais recente)'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800 cursor-pointer self-start"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <DiscResultContent resultado={resultado} respostas={respostas} />
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'status',    label: '📊 Acompanhar Status' },
  { id: 'resultados', label: '🔍 Consultar Resultados' },
];

const EMPRESAS_LIST = [
  { id: '', label: 'Todas as Empresas' },
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

export default function DiscHub() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('status');
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null);

  // ── Filtros ────────────────────────────────────
  const [filterNome, setFilterNome] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');
  const [filterFilial, setFilterFilial] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [showManagerModal, setShowManagerModal] = useState(false);
  const [managerRequestSuccess, setManagerRequestSuccess] = useState(null);

  // ── Role do usuário logado ─────────────────────
  const [userRole, setUserRole] = useState('RH');
  useEffect(() => {
    try {
      const stored = localStorage.getItem('@ConectaRH:user');
      if (stored) {
        const user = JSON.parse(stored);
        setUserRole(user.role || 'RH');
      }
    } catch { /* ignore */ }
  }, []);
  const isAdmin = userRole === 'ADMIN';

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/disc/links');
      if (res.data.sucesso) {
        setLinks(res.data.data || []);
      }
    } catch (err) {
      setError('Erro ao buscar os links DISC. Verifique a conexão com o servidor.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // ── Aplica filtros ─────────────────────────────
  const aplicarFiltros = (lista) => {
    let resultado = lista;

    // Filtro por nome (ambas as abas)
    if (filterNome.trim()) {
      const termo = filterNome.trim().toLowerCase();
      resultado = resultado.filter(l =>
        (l.nome || '').toLowerCase().includes(termo)
      );
    }

    // Filtro por empresa (ADMIN only, ambas as abas)
    if (isAdmin && filterEmpresa) {
      resultado = resultado.filter(l => l.companyId === filterEmpresa);
    }

    if (activeTab === 'status') {
      // Filtro por status (Apenas aba Status)
      if (filterStatus) {
        resultado = resultado.filter(l => l.status === filterStatus);
      }
    } else {
      // Filtro por filial (ADMIN only, Apenas aba Resultados)
      if (isAdmin && filterFilial.trim()) {
        resultado = resultado.filter(l => l.branchId === filterFilial.trim());
      }
    }

    return resultado;
  };

  // Filtra por aba + filtros do usuário
  const linksBaseTab = activeTab === 'status'
    ? links
    : links.filter((l) => l.status === 'CONCLUDED' && l.resultado);

  let linksFiltrados = aplicarFiltros(linksBaseTab);

  // Agrupamento de Histórico para a aba "Consultar Resultados"
  if (activeTab === 'resultados') {
    const grupo = {};
    linksFiltrados.forEach(link => {
      // CPF é o identificador mais forte, fallback para nome+empresa+isEmployee
      const key = link.cpf || `${link.nome?.trim().toLowerCase()}-${link.companyId}-${link.isEmployee}`;
      if (!grupo[key]) {
        grupo[key] = [];
      }
      grupo[key].push(link);
    });

    linksFiltrados = Object.values(grupo).map(arrayLinks => {
      // Ordena do mais recente para o mais antigo
      arrayLinks.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
      // Pega o mais recente e embute os outros em "historico"
      return { ...arrayLinks[0], historico: arrayLinks };
    });
    
    // Ordena os cards para mostrar os mais recentes primeiro
    linksFiltrados.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
  }

  // Contadores para badges nas abas (sobre dados totais, sem filtro)
  const countStatus = links.length;
  const countResultados = links.filter((l) => l.status === 'CONCLUDED' && l.resultado).length;

  // Verifica se há filtros ativos
  const hasActiveFilters = activeTab === 'status'
    ? filterNome.trim() || (isAdmin && filterEmpresa) || filterStatus
    : filterNome.trim() || (isAdmin && filterEmpresa) || (isAdmin && filterFilial.trim());

  const limparFiltros = () => {
    setFilterNome('');
    setFilterEmpresa('');
    setFilterFilial('');
    setFilterStatus('');
  };

  return (
    <>
      {selectedLink && (
        <DiscDetailModal link={selectedLink} onClose={() => setSelectedLink(null)} />
      )}

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Hub DISC</h1>
            <p className="text-gray-400 text-sm">
              Gerencie avaliações comportamentais, acompanhe status e consulte perfis gerados.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchLinks}
              title="Atualizar"
              className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-all cursor-pointer"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            {(userRole === 'ADMIN' || userRole === 'RH') && (
              <button
                onClick={() => navigate('/rh/disc-manager')}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-5 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 flex items-center gap-2 text-sm cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Gerar Novo Link
              </button>
            )}
          </div>
        </div>

        {/* Modal de Solicitação de Acesso */}
        {showManagerModal && (
          <ManagerRequestModal 
            onClose={() => setShowManagerModal(false)} 
            onSuccess={(msg) => setManagerRequestSuccess(msg)} 
          />
        )}

        {/* Mensagem de sucesso após pedir acesso */}
        {managerRequestSuccess && (
          <div className="mb-8 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm flex items-start gap-3 justify-between">
            <div className="flex items-start gap-2">
              <span className="text-lg">✅</span>
              <div>
                <strong className="font-semibold text-green-300 block mb-1">Solicitação Enviada!</strong>
                {managerRequestSuccess}
              </div>
            </div>
            <button onClick={() => setManagerRequestSuccess(null)} className="text-green-500/60 hover:text-green-400 cursor-pointer">✕</button>
          </div>
        )}

        {/* Banner para GESTORES PENDENTES (Role: USER) */}
        {userRole === 'USER' ? (
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[40vh] shadow-xl">
            <div className="w-16 h-16 bg-blue-500/10 flex items-center justify-center rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Painel de Liderança Bloqueado</h2>
            <p className="text-gray-400 text-sm max-w-lg mb-8 leading-relaxed">
              Você não possui permissões automáticas para visualizar os resultados DISC da empresa. 
              Se você é líder ou gestor de equipe, você pode solicitar a liberação do acesso para os seus Centros de Custo específicos.
            </p>
            <button
              onClick={() => setShowManagerModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/20"
            >
              Solicitar Acesso de Gestor
            </button>
          </div>
        ) : (
          <>
            {/* Cards de Resumo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total',        val: links.length,                                         cls: 'text-white',         bg: 'bg-gray-900 border-gray-800' },
                { label: 'Pendentes',    val: links.filter(l => l.status === 'PENDING').length,     cls: 'text-yellow-400',    bg: 'bg-yellow-500/5 border-yellow-500/20' },
                { label: 'Em Andamento', val: links.filter(l => l.status === 'PROGRESS').length,    cls: 'text-cyan-400',      bg: 'bg-cyan-500/5 border-cyan-500/20' },
                { label: 'Concluídos',   val: links.filter(l => l.status === 'CONCLUDED').length,   cls: 'text-green-400',     bg: 'bg-green-500/5 border-green-500/20' },
              ].map(c => (
                <div key={c.label} className={`border rounded-xl p-4 ${c.bg}`}>
                  <p className="text-gray-500 text-xs font-medium mb-1">{c.label}</p>
                  <p className={`text-2xl font-bold ${c.cls}`}>{c.val}</p>
                </div>
              ))}
            </div>

        {/* Tabs + Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-900/60 border border-gray-800 rounded-xl p-1 w-fit">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-800 text-gray-500'
                }`}>
                  {tab.id === 'status' ? countStatus : countResultados}
                </span>
              </button>
            ))}
          </div>

          {/* Botão limpar filtros */}
          {hasActiveFilters && (
            <button
              onClick={limparFiltros}
              className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpar filtros ({linksFiltrados.length}/{linksBaseTab.length})
            </button>
          )}
        </div>

        {/* Barra de Filtros */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          {activeTab === 'status' ? (
            /* Filtros para "Acompanhar Status" */
            <div className={`grid gap-3 ${isAdmin ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
              
              {/* Filtro por Status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">Todos os Status</option>
                <option value="PENDING">Pendente</option>
                <option value="PROGRESS">Em Andamento</option>
                <option value="CONCLUDED">Concluído</option>
                <option value="EXPIRED">Expirado</option>
              </select>

              {/* Filtro por Nome */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={filterNome}
                  onChange={(e) => setFilterNome(e.target.value)}
                  placeholder="Filtrar por nome..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Filtro por Empresa (ADMIN only) */}
              {isAdmin && (
                <select
                  value={filterEmpresa}
                  onChange={(e) => setFilterEmpresa(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {EMPRESAS_LIST.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.id ? `${emp.id} - ${emp.label}` : emp.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            /* Filtros originais para "Consultar Resultados" */
            <div className={`grid gap-3 ${isAdmin ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1'}`}>
              
              {/* Filtro por Nome */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={filterNome}
                  onChange={(e) => setFilterNome(e.target.value)}
                  placeholder="Filtrar por nome..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Filtro por Empresa (ADMIN only) */}
              {isAdmin && (
                <select
                  value={filterEmpresa}
                  onChange={(e) => setFilterEmpresa(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {EMPRESAS_LIST.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.id ? `${emp.id} - ${emp.label}` : emp.label}
                    </option>
                  ))}
                </select>
              )}

              {/* Filtro por Filial (ADMIN only) */}
              {isAdmin && (
                <input
                  type="text"
                  value={filterFilial}
                  onChange={(e) => setFilterFilial(e.target.value)}
                  placeholder="Filtrar por filial..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2.5 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              )}
            </div>
          )}
        </div>

        {/* Erro */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Conteúdo */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500">
            <svg className="w-6 h-6 animate-spin mr-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Carregando…
          </div>
        ) : linksFiltrados.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">
              {hasActiveFilters
                ? 'Nenhum resultado encontrado com os filtros aplicados.'
                : activeTab === 'status'
                  ? 'Nenhum link DISC gerado ainda.'
                  : 'Nenhum DISC concluído com resultado disponível.'}
            </p>
          </div>
        ) : activeTab === 'status' ? (
          /* ─── ABA: ACOMPANHAR STATUS ─── */
          <div className="space-y-3">
            {linksFiltrados.map(link => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        ) : (
          /* ─── ABA: CONSULTAR RESULTADOS ─── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {linksFiltrados.map(link => {
              const resultado = link.resultado || {};
              // ALTERADO: Usa Ambiente Adaptado em vez de Natural para exibir perfil dominante no card
              const adaptado = resultado.adaptado || resultado.ambienteAdaptado || {};
              const dominante = Object.entries(adaptado).reduce(
                (max, [k, v]) => (v > max[1] ? [k, v] : max),
                ['?', -1]
              )[0];
              const perfil = DISC_PROFILES[dominante];

              return (
                <div
                  key={link.id}
                  onClick={() => setSelectedLink(link)}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-blue-500/50 hover:bg-gray-800/70 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-base">
                        {perfil?.emoji || '🔘'}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm truncate max-w-[160px]">{link.nome || '—'}</p>
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-medium ${perfil?.cor || 'text-gray-400'}`}>
                            {perfil?.nome || 'Perfil indefinido'}
                          </p>
                          {link.historico && link.historico.length > 1 && (
                            <span className="bg-gray-800 text-gray-400 text-[10px] px-1.5 py-0.5 rounded" title="Possui testes anteriores">
                              Histórico ({link.historico.length})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={link.status} />
                  </div>

                  {/* Mini barras do perfil — ALTERADO: Agora exibe dados do Ambiente Adaptado */}
                  {Object.keys(adaptado).length > 0 && (
                    <div className="space-y-1.5 mb-4">
                      {['D', 'I', 'S', 'C'].map(letra => (
                        <div key={letra} className="flex items-center gap-2">
                          <span className="text-gray-500 text-xs w-4">{letra}</span>
                          <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${DISC_PROFILES[letra]?.corBarra || 'bg-gray-600'}`}
                              style={{ width: `${adaptado[letra] || 0}%` }}
                            />
                          </div>
                          <span className="text-gray-500 text-xs w-7 text-right">{adaptado[letra] || 0}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">
                      {link.isEmployee 
                        ? `👤 Funcionário${link.departmentDescription ? ` - ${link.departmentDescription}` : (link.departamentCode ? ` - ${link.departamentCode}` : '')}` 
                        : '🧩 Candidato'}
                    </span>
                    <span className="text-blue-400 text-xs font-medium group-hover:underline">
                      Ver detalhes →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </>
        )}
      </main>
    </>
  );
}
