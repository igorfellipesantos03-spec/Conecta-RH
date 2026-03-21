import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Mock das 24 questões (Estrutura baseada na imagem fornecida)
// Cada questão tem 4 alternativas. O usuário precisa escolher 1 "MAIS" e 1 "MENOS" por bloco.
const questoesDISC = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  opcoes: [
    { id: 'A', letraMais: 'D', letraMenos: 'S', texto: `Opção A da questão ${i + 1}` },
    { id: 'B', letraMais: 'I', letraMenos: 'C', texto: `Opção B da questão ${i + 1}` },
    { id: 'C', letraMais: 'S', letraMenos: 'D', texto: `Opção C da questão ${i + 1}` },
    { id: 'D', letraMais: 'C', letraMenos: 'I', texto: `Opção D da questão ${i + 1}` },
  ]
}));

// Substituindo apenas a Questão 1 e 2 com dados reais da imagem como Exemplo:
questoesDISC[0].opcoes = [
  { id: 'A', letraMais: 'S', letraMenos: 'I', texto: 'amável, gentil' },
  { id: 'B', letraMais: 'I', letraMenos: 'C', texto: 'persuasivo, convincente' },
  { id: 'C', letraMais: 'C', letraMenos: 'D', texto: 'humilde, reservado, modesto' },
  { id: 'D', letraMais: 'D', letraMenos: 'S', texto: 'original, inovador, diferente' },
];
questoesDISC[1].opcoes = [
  { id: 'A', letraMais: 'I', letraMenos: 'S', texto: 'atrativo, simpático, agradável' },
  { id: 'B', letraMais: 'S', letraMenos: 'D', texto: 'cooperativo, está de acordo' },
  { id: 'C', letraMais: 'D', letraMenos: 'C', texto: 'teimoso, tenaz, combativo' },
  { id: 'D', letraMais: 'C', letraMenos: 'I', texto: 'doce, complacente' },
];

export default function DiscForm() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [cpf, setCpf] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  
  const [isUserValidated, setIsUserValidated] = useState(false);
  const [colaborador, setColaborador] = useState(null);
  
  // Controle de link
  const [loadingContext, setLoadingContext] = useState(true);
  const [linkContext, setLinkContext] = useState(null); // { isEmployee: true/false }
  const [linkError, setLinkError] = useState(null);

  const [respostas, setRespostas] = useState({}); // { 1: { mais: 'A', menos: 'C' } }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Busca dados do Link assim que a página monta
  useEffect(() => {
    const fetchLinkData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/disc/link/${token}`);
        if (response.data.sucesso) {
           setLinkContext(response.data.dados);
        } else {
           setLinkError(response.data.mensagem);
        }
      } catch (err) {
        setLinkError('Erro ao consultar a validade do Link.');
      } finally {
        setLoadingContext(false);
      }
    };
    fetchLinkData();
  }, [token]);

  const handleValidarIdentidade = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Fluxo Funcionario Interno (Valida CPF no Protheus)
    if (linkContext?.isEmployee) {
      try {
        const response = await axios.get(`http://localhost:3001/api/employees/check-cpf/${cpf}?token=${token}`);
        if (response.data.sucesso) {
          setColaborador(response.data.dados);
          setIsUserValidated(true);
        } else {
          setError(response.data.mensagem);
        }
      } catch (err) {
        setError(err.response?.data?.mensagem || 'Erro ao validar CPF ou Token inválido.');
      } finally {
        setLoading(false);
      }
    } 
    // Fluxo Candidato Externo (Apenas Registra Nome)
    else {
      if (nomeCompleto.trim().length < 5) {
        setError("Por favor, informe seu nome e sobrenome.");
        setLoading(false);
        return;
      }
      setColaborador({ nome: nomeCompleto });
      setIsUserValidated(true);
      setLoading(false);
    }
  };


  const handleSelectOpcao = (questaoId, tipo, opcaoId) => {
    setRespostas(prev => {
      const respAtual = prev[questaoId] || {};
      
      // Regra: Uma opção nao pode ser Mais e Menos ao mesmo tempo
      if (tipo === 'mais' && respAtual.menos === opcaoId) respAtual.menos = null;
      if (tipo === 'menos' && respAtual.mais === opcaoId) respAtual.mais = null;

      return {
        ...prev,
        [questaoId]: { ...respAtual, [tipo]: opcaoId }
      };
    });
  };

  const handleSubmitTeste = async () => {
    // Validar se todas as 24 questoes tem Mais e Menos
    const respondidas = Object.keys(respostas).length;
    const incompletas = Object.values(respostas).some(r => !r.mais || !r.menos);

    if (respondidas < 24 || incompletas) {
      return alert('Por favor, preencha exatamente UM "Mais" e UM "Menos" em TODAS as 24 questões antes de finalizar.');
    }

    setLoading(true);

    try {
      // Formata o payload para o backend: extrai as letras de cada resposta
      const payloadFormatado = questoesDISC.map(q => {
        const resp = respostas[q.id];
        const opcaoMais = q.opcoes.find(o => o.id === resp.mais);
        const opcaoMenos = q.opcoes.find(o => o.id === resp.menos);

        return {
          mais: opcaoMais.letraMais,
          menos: opcaoMenos.letraMenos
        };
      });

      const response = await axios.post('http://localhost:3001/api/disc/calcular', {
        respostas: payloadFormatado
      });

      if (response.data.sucesso) {
        // Redireciona para os resultados públicos do candidato (isolado do RH)
        navigate(`/disc/responder/${token}/resultados`, { state: { resultados: response.data.data } });
      } else {
        alert(response.data.mensagem);
      }
    } catch (err) {
      alert('Erro ao enviar as respostas. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // TELA DE AUTENTICAÇÃO / BOAS-VINDAS
  if (loadingContext) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-gray-100 font-sans">
        <svg className="w-10 h-10 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <p className="mt-4 text-gray-400">Verificando validade do link...</p>
      </div>
    );
  }

  if (linkError) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-gray-100 font-sans">
         <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-2xl max-w-md text-center">
            <h2 className="text-xl font-bold text-red-500 mb-2">Link Inválido</h2>
            <p className="text-red-200 text-sm">{linkError}</p>
         </div>
      </div>
    );
  }

  if (!isUserValidated) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-gray-100 font-sans">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Avaliação DISC</h1>
            <p className="text-gray-400 text-sm">
              {linkContext?.isEmployee 
                ? 'Por favor, informe seu CPF para iniciar o teste.' 
                : 'Por favor, informe seu Nome Completo para iniciar o teste.'}
            </p>
          </div>

          <form onSubmit={handleValidarIdentidade} className="space-y-6">
            
            {/* Contexto: Funcionário (CPF) */}
            {linkContext?.isEmployee && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Seu CPF (só números)</label>
                <input
                  type="text"
                  required
                  value={cpf}
                  onChange={e => setCpf(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="00011122233"
                  maxLength={11}
                />
              </div>
            )}

            {/* Contexto: Candidato Externo (Nome) */}
            {!linkContext?.isEmployee && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={nomeCompleto}
                  onChange={e => setNomeCompleto(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Ex: Maria da Silva"
                />
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (linkContext?.isEmployee ? cpf.length < 11 : nomeCompleto.length < 5)}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              {loading ? 'Processando...' : 'Iniciar Avaliação'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // TELA DO QUESTIONÁRIO
  return (
    <div className="min-h-screen bg-gray-950 font-sans text-gray-100 pb-20">
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-10 text-center">
          <p className="text-[#0056D2] font-semibold mb-2 tracking-wide uppercase text-sm">
            Bem-vindo(a), {colaborador?.name || colaborador?.nome}
          </p>
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Avaliação DISC</h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Para cada grupo de 4 palavras abaixo, escolha <strong>UMA</strong> palavra que MAIS te descreve (+) e <strong>UMA</strong> palavra que MENOS te descreve (-).
          </p>
        </div>

        <div className="space-y-8">
          {questoesDISC.map((q, index) => {
            const resp = respostas[q.id] || {};
            const isCompleto = resp.mais && resp.menos;

            return (
              <div 
                key={q.id} 
                className={`bg-gray-900 border rounded-2xl p-6 transition-all duration-300 ${
                  isCompleto ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'border-gray-800'
                }`}
              >
                <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                  <h3 className="text-xl font-bold text-white">Questão {q.id}</h3>
                  {isCompleto && (
                    <span className="text-xs font-semibold px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full">
                      Preenchida
                    </span>
                  )}
                </div>

                {/* Tabela Desktop / Cards Mobile */}
                <div className="hidden sm:grid grid-cols-12 gap-4 mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider text-center px-4">
                  <div className="col-span-8 text-left">Características</div>
                  <div className="col-span-2 text-blue-400">+ MAIS</div>
                  <div className="col-span-2 text-red-400">- MENOS</div>
                </div>

                <div className="space-y-3">
                  {q.opcoes.map(opcao => (
                    <div key={opcao.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-gray-950 border border-gray-800 hover:border-gray-700 transition-colors">
                      <div className="flex-1 flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded bg-gray-800 text-xs font-bold text-gray-400">
                          {opcao.id}
                        </span>
                        <span className="text-gray-200">{opcao.texto}</span>
                      </div>

                      <div className="flex gap-6 sm:w-1/3 justify-around border-t sm:border-t-0 border-gray-800 pt-3 sm:pt-0">
                        {/* Radio MAIS */}
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="radio"
                            name={`q${q.id}_mais`}
                            checked={resp.mais === opcao.id}
                            onChange={() => handleSelectOpcao(q.id, 'mais', opcao.id)}
                            className="w-5 h-5 text-blue-500 bg-gray-900 border-gray-700 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="sm:hidden text-sm text-blue-400 font-medium">+ Mais</span>
                        </label>

                        {/* Radio MENOS */}
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="radio"
                            name={`q${q.id}_menos`}
                            checked={resp.menos === opcao.id}
                            onChange={() => handleSelectOpcao(q.id, 'menos', opcao.id)}
                            className="w-5 h-5 text-red-500 bg-gray-900 border-gray-700 focus:ring-red-500 cursor-pointer"
                          />
                          <span className="sm:hidden text-sm text-red-400 font-medium">- Menos</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center sticky bottom-6 z-40 bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl border border-gray-800 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="text-sm font-medium text-gray-400">
              <span className="text-blue-400 text-lg font-bold">{Object.keys(respostas).filter(k => respostas[k].mais && respostas[k].menos).length}</span> / 24 respondidas
            </div>
            <button 
              onClick={handleSubmitTeste}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium py-3 px-10 rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-1 cursor-pointer"
            >
              {loading ? 'Enviando...' : 'Finalizar e Ver Resultados'}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
