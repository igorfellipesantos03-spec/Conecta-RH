import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Lista de Empresas para traduzir IDs
const EMPRESAS = {
  '07': 'Conasa Infraestrutura', '23': 'Águas de Itapema', '24': 'Águas de Santo Antônio',
  '25': 'Sanesul', '26': 'Luz de Belém', '27': 'Sanesalto', '28': 'Sanetrat',
  '29': 'Conasa SPE', '31': 'Urbeluz S.A.', '32': 'Alegrete RJ', '33': 'Caraguá Luz',
  '35': 'Sanema', '36': 'ASB', '37': 'MT100', '38': 'Urbeluz SCP Campos',
  '39': 'Marabá Luz', '40': 'MT320', '42': 'MT246', '43': 'BR163', '44': 'Águas do Sertão'
};

export default function AccessApprovalHub() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Role do usuário logado ─────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem('@ConectaRH:user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user.role !== 'RH' && user.role !== 'ADMIN') {
          navigate('/');
        }
      } else {
        navigate('/rh/login');
      }
    } catch {
      navigate('/rh/login');
    }
  }, [navigate]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('@ConectaRH:token') || localStorage.getItem('@ConectaRH:access_token');
      const res = await axios.get(`http://192.168.0.144:3001/api/access/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setRequests(res.data.data || []);
      }
    } catch (err) {
      setError('Erro ao buscar as solicitações de acesso. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (id, action) => {
    try {
      const token = localStorage.getItem('@ConectaRH:token') || localStorage.getItem('@ConectaRH:access_token');
      const endpoint = action === 'approve'
        ? `http://192.168.0.144:3001/api/access/requests/${id}/approve`
        : `http://192.168.0.144:3001/api/access/requests/${id}/reject`;

      await axios.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRequests(prev => prev.map(req => {
        if (req.id === id) {
          return { ...req, status: action === 'approve' ? 'APPROVED' : 'REJECTED' };
        }
        return req;
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao processar solicitação.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded text-xs font-semibold">Pendente</span>;
      case 'APPROVED': return <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-xs font-semibold">Aprovado</span>;
      case 'REJECTED': return <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded text-xs font-semibold">Recusado</span>;
      default: return null;
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const historyRequests = requests.filter(r => r.status !== 'PENDING');

  return (
    <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-10 bg-gray-950 min-h-screen font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Aprovações de Acesso</h1>
        <p className="text-gray-400 text-sm">
          Gerencie as solicitações de líderes que desejam acesso ao painel de resultados DISC de suas respectivas equipes.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <svg className="w-6 h-6 animate-spin mr-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Carregando solicitações…
        </div>
      ) : (
        <div className="space-y-10">
          {/* Sessão Pendentes */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center justify-between">
              Aguardando Aprovação
              <span className="bg-blue-600/20 text-blue-400 py-1 px-3 rounded-full text-xs font-bold border border-blue-500/30">
                {pendingRequests.length} pendentes
              </span>
            </h2>

            {pendingRequests.length === 0 ? (
              <div className="border border-dashed border-gray-800 rounded-2xl p-10 text-center">
                <p className="text-gray-500 text-sm">Nenhuma solicitação pendente no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pendingRequests.map(req => (
                  <div key={req.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm hover:border-gray-700 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-white">{req.user?.name || req.user?.username || 'Usuário'}</h3>
                          {getStatusBadge(req.status)}
                        </div>
                        <p className="text-gray-400 text-xs font-mono mb-2">
                          Usuário: {req.user?.username || '—'}
                        </p>

                        {/* Empresa/Filial solicitada */}
                        {req.requestedEmpresaId && (
                          <div className="flex gap-3 mb-4 text-xs">
                            <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded">
                              Empresa: {EMPRESAS[req.requestedEmpresaId] || req.requestedEmpresaId}
                            </span>
                            <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded">
                              Filial: {req.requestedFilialId || '01'}
                            </span>
                          </div>
                        )}

                        <div className="mb-4">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Centros de Custo Solicitados:</h4>
                          <div className="flex flex-wrap gap-2">
                            {(req.requestedDepts || []).map((dept, idx) => (
                              <span key={idx} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-md text-xs font-medium">
                                [{dept.code}] {dept.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        {req.justification && (
                          <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
                            <h4 className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Justificativa:</h4>
                            <p className="text-gray-300 text-xs italic">"{req.justification}"</p>
                          </div>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex flex-row md:flex-col gap-2 shrink-0 md:min-w-[120px] mt-4 md:mt-0 border-t border-gray-800 pt-4 md:border-t-0 md:pt-0">
                        <button
                          onClick={() => handleAction(req.id, 'approve')}
                          className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer text-center"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'reject')}
                          className="flex-1 bg-red-600/10 hover:bg-red-600/20 text-red-500 hover:text-red-400 border border-red-500/50 text-xs font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer text-center"
                        >
                          Recusar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Sessão Histórico */}
          {historyRequests.length > 0 && (
            <section className="opacity-80">
              <h2 className="text-lg font-semibold text-gray-400 mb-4">Histórico Recente</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {historyRequests.slice(0, 10).map(req => (
                  <div key={req.id} className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-300">{req.user?.name || req.user?.username}</h3>
                      <p className="text-gray-500 text-xs">{(req.requestedDepts || []).length} setores solicitados</p>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
