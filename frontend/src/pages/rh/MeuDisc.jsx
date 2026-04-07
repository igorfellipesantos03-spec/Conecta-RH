import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { DiscResultContent } from '../../components/DiscResultView';

export default function MeuDisc() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [discData, setDiscData] = useState(null);
  const [error, setError] = useState(null);
  
  // Estado para o formulário de CPF
  const [showCpfForm, setShowCpfForm] = useState(false);
  const [cpf, setCpf] = useState('');
  const [linking, setLinking] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Tenta buscar o DISC do usuário
      const res = await api.get('/disc/meu-disc');
      
      if (res.data.sucesso) {
        setDiscData(res.data.data);
        setShowCpfForm(false);
      }
    } catch (err) {
      const status = err.response?.status;
      const mensagem = err.response?.data?.mensagem;

      if (status === 400 && mensagem?.includes('CPF não cadastrado')) {
        // Usuário ainda não tem CPF vinculado no sistema
        setShowCpfForm(true);
      } else if (status === 404) {
        // Tem CPF mas não tem teste DISC concluído
        setDiscData(null);
        setShowCpfForm(false);
      } else {
        setError('Erro ao carregar seus dados do DISC. Tente novamente mais tarde.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Pegar dados básicos do usuário do localStorage
    try {
      const storedUser = JSON.parse(localStorage.getItem('@ConectaRH:user') || '{}');
      setUser(storedUser);
    } catch (e) {}

    fetchData();
  }, [fetchData]);

  const handleVincularCpf = async (e) => {
    e.preventDefault();
    const cleanCpf = cpf.replace(/\D/g, '');
    
    if (cleanCpf.length !== 11) {
      alert('CPF inválido. Digite os 11 dígitos.');
      return;
    }

    setLinking(true);
    try {
      const res = await api.post('/disc/vincular-cpf', { cpf: cleanCpf });
      if (res.data.sucesso) {
        // Atualiza o usuário no localStorage para refletir que agora tem CPF
        const updatedUser = { ...user, cpf: cleanCpf };
        localStorage.setItem('@ConectaRH:user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        // Recarrega os dados do DISC
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.mensagem || 'Erro ao vincular CPF.');
      console.error(err);
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-400 animate-pulse">Carregando seu perfil DISC...</p>
        </div>
      </div>
    );
  }

  // ── ESTADO 1: PRECISA VINCULAR CPF ──────────────────────────
  if (showCpfForm) {
    return (
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-12 lg:py-20">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Decoração de Fundo */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-3xl rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/10 blur-3xl rounded-full" />

          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-blue-600/15 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">Primeiro Acesso ao DISC</h1>
            <p className="text-gray-400 mb-10 max-w-md mx-auto">
              Para visualizar seu relatório, precisamos confirmar seu CPF. Esta ação será necessária apenas uma vez.
            </p>

            <form onSubmit={handleVincularCpf} className="space-y-6 max-w-sm mx-auto">
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-500 mb-2 ml-1">Digite seu CPF (apenas números)</label>
                <input 
                  type="text"
                  maxLength="11"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
                  placeholder="00000000000"
                  className="w-full bg-gray-950 border border-gray-800 focus:border-blue-500 rounded-2xl px-6 py-4 text-white text-lg font-mono tracking-widest outline-none transition-all placeholder:text-gray-700"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={linking || cpf.length !== 11}
                className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl shadow-blue-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer
                  ${linking || cpf.length !== 11 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
                    : 'bg-blue-600 hover:bg-blue-500 hover:-translate-y-0.5 active:translate-y-0'
                  }`}
              >
                {linking ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  'Visualizar Meu Relatório'
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // ── ESTADO 2: ERRO ──────────────────────────────────────────
  if (error) {
    return (
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-12 lg:py-20 text-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-10">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{error}</h2>
          <button 
            onClick={fetchData}
            className="mt-4 text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  // ── ESTADO 3: NÃO TEM TESTE CONCLUÍDO ───────────────────────
  if (!discData) {
    return (
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-12 lg:py-20 text-center">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 shadow-xl">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Nenhum relatório encontrado</h2>
          <p className="text-gray-400 mb-6">
            Identificamos seu CPF, mas ainda não há um teste DISC concluído para você no sistema.
          </p>
          <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-sm text-blue-400/80">
            Fale com seu gestor ou com o RH para solicitar um link de avaliação DISC.
          </div>
          <button 
            onClick={() => navigate('/')}
            className="mt-8 px-8 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all cursor-pointer font-medium"
          >
            Voltar ao Início
          </button>
        </div>
      </main>
    );
  }

  // ── ESTADO 4: EXIBE RESULTADO ───────────────────────────────
  return (
    <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-10">
      {/* Cabeçalho Premium */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
               Relatório Individual
             </span>
             <span className="text-gray-600">•</span>
             <span className="text-gray-500 text-xs">
               Atualizado em {new Date(discData.criadoEm).toLocaleDateString('pt-BR')}
             </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Meu Perfil <span className="text-blue-500">DISC</span>
          </h1>
          <p className="text-gray-400 mt-2">
            Explore seus pontos fortes, estilo de comunicação e tendências comportamentais.
          </p>
        </div>
      </div>

      {/* Grid de Conteúdo */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <DiscResultContent resultado={discData.resultado} />
      </div>

      {/* Footer / Nota de Apoio */}
      <div className="mt-20 p-8 border-t border-gray-800 flex flex-col md:flex-row items-center gap-6">
        <div className="w-14 h-14 bg-blue-600/10 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-center md:text-left">
          <h4 className="text-white font-semibold mb-1">Como utilizar este resultado?</h4>
          <p className="text-sm text-gray-500">
            Seu perfil comportamental é uma ferramenta de autoconhecimento. Use estas informações para melhorar sua comunicação, entender seus gatilhos de produtividade e colaborar melhor com seus colegas.
          </p>
        </div>
      </div>
    </main>
  );
}
