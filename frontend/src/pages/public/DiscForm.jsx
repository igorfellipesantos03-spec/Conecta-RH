import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const questoesDISC = [
  {
    pergunta: 1,
    opcoes: [
      { id: 'A', letra: 'S', texto: 'amável, gentil' },
      { id: 'B', letra: 'I', texto: 'persuasivo, convincente' },
      { id: 'C', letra: 'C', texto: 'humilde, reservado, modesto' },
      { id: 'D', letra: 'D', texto: 'original, inovador, diferente' },
    ]
  },
  {
    pergunta: 2,
    opcoes: [
      { id: 'A', letra: 'I', texto: 'atrativo, simpático, agradável para os demais' },
      { id: 'B', letra: 'S', texto: 'cooperativo, está de acordo com freqüência' },
      { id: 'C', letra: 'D', texto: 'teimoso, tenaz, combativo' },
      { id: 'D', letra: 'C', texto: 'doce, complacente' },
    ]
  },
  {
    pergunta: 3,
    opcoes: [
      { id: 'A', letra: 'D', texto: 'facilmente lidera, independente' },
      { id: 'B', letra: 'I', texto: 'divertido, adora dar risadas' },
      { id: 'C', letra: 'S', texto: 'leal, aapegado' },
      { id: 'D', letra: 'C', texto: 'encantador, doce' },
    ]
  },
  {
    pergunta: 4,
    opcoes: [
      { id: 'A', letra: 'I', texto: 'mente aberta, receptivo' },
      { id: 'B', letra: 'S', texto: 'reconhecido pelos demais, gosta de ajudar' },
      { id: 'C', letra: 'D', texto: 'voluntarioso, caráter forte e decidido' },
      { id: 'D', letra: 'C', texto: 'alegre, divertido' },
    ]
  },
  {
    pergunta: 5,
    opcoes: [
      { id: 'A', letra: 'I', texto: 'jovial, gosta de alegrar as pessoas' },
      { id: 'B', letra: 'C', texto: 'preciso, exato' },
      { id: 'C', letra: 'D', texto: 'decidido, determinado, audaz' },
      { id: 'D', letra: 'S', texto: 'estável, de temperamento tranqüilo, calmo' },
    ]
  },
  {
    pergunta: 6,
    opcoes: [
      { id: 'A', letra: 'D', texto: 'competitivo, busca ganhar' },
      { id: 'B', letra: 'S', texto: 'carinhoso, tem muito tato' },
      { id: 'C', letra: 'I', texto: 'extrovertido, gosta de divertir-se' },
      { id: 'D', letra: 'C', texto: 'harmonioso, busca o acordo' },
    ]
  },
  {
    pergunta: 7,
    opcoes: [
      { id: 'A', letra: 'C', texto: 'exigente, difícil de satisfazer' },
      { id: 'B', letra: 'S', texto: 'obediente, faz o que lhe pedem que faça, comedido' },
      { id: 'C', letra: 'D', texto: 'tenaz e decidido, determinado' },
      { id: 'D', letra: 'I', texto: 'brincalhão, divertido' },
    ]
  },
  {
    pergunta: 8,
    opcoes: [
      { id: 'A', letra: 'D', texto: 'valente, temerário, cheio de coragem' },
      { id: 'B', letra: 'I', texto: 'inspirador, estimulante, motivador' },
      { id: 'C', letra: 'S', texto: 'obediente, não confronta, cede facilmente' },
      { id: 'D', letra: 'C', texto: 'tímido, apreensivo, calado' },
    ]
  },
  {
    pergunta: 9,
    opcoes: [
      { id: 'A', letra: 'I', texto: 'sociável, desfruta da companhia dos outros' },
      { id: 'B', letra: 'S', texto: 'paciente, estável, tolerante' },
      { id: 'C', letra: 'D', texto: 'auto-suficiente, independente' },
      { id: 'D', letra: 'C', texto: 'reservado' },
    ]
  },
  {
    pergunta: 10,
    opcoes: [
      { id: 'A', letra: 'D', texto: 'aventureiro, desejoso de arriscar-se' },
      { id: 'B', letra: 'S', texto: 'receptivo, aberto a sugestões' },
      { id: 'C', letra: 'I', texto: 'cordial, cálido, amistoso' },
      { id: 'D', letra: 'C', texto: 'moderado, evita os extremos' },
    ]
  },
  {
    pergunta: 11,
    opcoes: [
      { id: 'A', letra: 'I', texto: 'expressivo, fala muito' },
      { id: 'B', letra: 'S', texto: 'controlado, pouco expressivo' },
      { id: 'C', letra: 'C', texto: 'convencional, sistemático, gosta da rotina' },
      { id: 'D', letra: 'D', texto: 'decidido, certo, firme ao tomar decisões' },
    ]
  },
  {
    pergunta: 12,
    opcoes: [
      { id: 'A', letra: 'C', texto: 'refinado, elegante ao falar' },
      { id: 'B', letra: 'D', texto: 'busca desafios, assume riscos' },
      { id: 'C', letra: 'S', texto: 'diplomático, tem tato com as pessoas' },
      { id: 'D', letra: 'I', texto: 'satisfeito, contente, confortável' },
    ]
  },
  {
    pergunta: 13,
    opcoes: [
      { id: 'A', letra: 'D', texto: 'agressivo, desafiante, enfocado na ação ou objetivo' },
      { id: 'B', letra: 'I', texto: 'alma da festa, divertido, extrovertido' },
      { id: 'C', letra: 'S', texto: 'ingênuo, é fácil que se aproveitem dele' },
      { id: 'D', letra: 'C', texto: 'temeroso, tende a preocupar-se muito' },
    ]
  },
  {
    pergunta: 14,
    opcoes: [
      { id: 'A', letra: 'C', texto: 'cuidadoso, desconfiado, cauteloso' },
      { id: 'B', letra: 'D', texto: 'determinado, decidido, não desiste, se põe firme' },
      { id: 'C', letra: 'I', texto: 'convincente, transmite segurança' },
      { id: 'D', letra: 'S', texto: 'de bom caráter, cortês, gosta de satisfazer os demais' },
    ]
  },
  {
    pergunta: 15,
    opcoes: [
      { id: 'A', letra: 'I', texto: 'entusiasta, se envolve com o que faz' },
      { id: 'B', letra: 'D', texto: 'impaciente, ansioso, desesperado às vezes' },
      { id: 'C', letra: 'S', texto: 'amistoso, consegue acordos, aceita' },
      { id: 'D', letra: 'C', texto: 'animado, vivaz, entusiasta' },
    ]
  },
  {
    pergunta: 16,
    opcoes: [
      { id: 'A', letra: 'D', texto: 'tem autoconfiança, crê em si mesmo, seguro' },
      { id: 'B', letra: 'S', texto: 'compreensivo, compassivo, apoiador das pessoas' },
      { id: 'C', letra: 'C', texto: 'tolerante' },
      { id: 'D', letra: 'I', texto: 'assertivo, agressivo, direto' },
    ]
  },
  {
    pergunta: 17,
    opcoes: [
      { id: 'A', letra: 'C', texto: 'muito disciplinado, auto controlado' },
      { id: 'B', letra: 'S', texto: 'generoso, gosta de compartilhar' },
      { id: 'C', letra: 'I', texto: 'animado, expressivo, usa muitos gestos' },
      { id: 'D', letra: 'D', texto: 'persistente, não volta atrás, se nega a perder' },
    ]
  },
  {
    pergunta: 18,
    opcoes: [
      { id: 'A', letra: 'I', texto: 'admirável, digno de reconhecimento' },
      { id: 'B', letra: 'S', texto: 'amável, desejoso de ajudar e de compartilhar' },
      { id: 'C', letra: 'C', texto: 'resignado, desiste, não luta' },
      { id: 'D', letra: 'D', texto: 'caráter forte, poderoso' },
    ]
  },
  {
    pergunta: 19,
    opcoes: [
      { id: 'A', letra: 'S', texto: 'respeitoso, trata as pessoas com consideração' },
      { id: 'B', letra: 'D', texto: 'pioneiro, explorador, inovador' },
      { id: 'C', letra: 'I', texto: 'otimista, vê o lado positivo de tudo' },
      { id: 'D', letra: 'C', texto: 'se acomoda, complacente, pronto para ajudar' },
    ]
  },
  {
    pergunta: 20,
    opcoes: [
      { id: 'A', letra: 'D', texto: 'gosta de discutir, controverso, confrontante' },
      { id: 'B', letra: 'I', texto: 'adaptável, flexível' },
      { id: 'C', letra: 'S', texto: 'relaxado, leva as coisas com calma, tranqüilo' },
      { id: 'D', letra: 'C', texto: 'leve, despreocupado, descomplicado' },
    ]
  },
  {
    pergunta: 21,
    opcoes: [
      { id: 'A', letra: 'I', texto: 'confia nos demais, tem fé nas pessoas' },
      { id: 'B', letra: 'S', texto: 'contente, satisfeito' },
      { id: 'C', letra: 'D', texto: 'positivo, não admite dúvidas nem temores' },
      { id: 'D', letra: 'C', texto: 'pacífico, tranqüilo' },
    ]
  },
  {
    pergunta: 22,
    opcoes: [
      { id: 'A', letra: 'I', texto: 'socialmente hábil, gosta de estar com os demais' },
      { id: 'B', letra: 'C', texto: 'educado, culto, conhecedor' },
      { id: 'C', letra: 'D', texto: 'vigoroso, enérgico' },
      { id: 'D', letra: 'S', texto: 'tolerante, pouco exato, compreensivo' },
    ]
  },
  {
    pergunta: 23,
    opcoes: [
      { id: 'A', letra: 'I', texto: 'agradável, sua companhia é prazerosa' },
      { id: 'B', letra: 'C', texto: 'exato, correto, preciso' },
      { id: 'C', letra: 'D', texto: 'tem opiniões claras, fala livre e abertamente' },
      { id: 'D', letra: 'S', texto: 'reservado, controlado' },
    ]
  },
  {
    pergunta: 24,
    opcoes: [
      { id: 'A', letra: 'D', texto: 'impaciente, não se permite relaxar, não descansa' },
      { id: 'B', letra: 'I', texto: 'sociável, amável' },
      { id: 'C', letra: 'S', texto: 'popular, apreciado por muitas pessoas' },
      { id: 'D', letra: 'C', texto: 'ordenado, organizado, claro' },
    ]
  }
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
  const [linkContext, setLinkContext] = useState(null);
  const [linkError, setLinkError] = useState(null);
  const [isObfuscatedError, setIsObfuscatedError] = useState(false);

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
        if (err.response && err.response.status === 404) {
          setIsObfuscatedError(true);
        } else {
          setLinkError('Erro ao consultar a validade do Link.');
        }
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
    // Fluxo Candidato Externo (Nome e CPF)
    else {
      if (cpf.length < 11) {
        setError("Por favor, informe um CPF válido contendo 11 números.");
        setLoading(false);
        return;
      }
      if (nomeCompleto.trim().length < 5) {
        setError("Por favor, informe seu nome e sobrenome.");
        setLoading(false);
        return;
      }
      setColaborador({ nome: nomeCompleto, cpf: cpf });
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
      const rawAdaptado = { D: 0, I: 0, S: 0, C: 0 };
      const rawNatural = { D: 0, I: 0, S: 0, C: 0 };

      questoesDISC.forEach(q => {
        const resp = respostas[q.pergunta];
        if (resp) {
          const opcaoMais = q.opcoes.find(o => o.id === resp.mais);
          const opcaoMenos = q.opcoes.find(o => o.id === resp.menos);

          if (opcaoMais && opcaoMais.letra) rawAdaptado[opcaoMais.letra] += 1;
          if (opcaoMenos && opcaoMenos.letra) rawNatural[opcaoMenos.letra] += 1;
        }
      });

      const normatizar = (val) => Math.min(100, Math.round((val / 24) * 100 * 1.15));

      const resultados = {
        adaptado: {
          D: normatizar(rawAdaptado.D),
          I: normatizar(rawAdaptado.I),
          S: normatizar(rawAdaptado.S),
          C: normatizar(rawAdaptado.C),
        },
        natural: {
          D: normatizar(rawNatural.D),
          I: normatizar(rawNatural.I),
          S: normatizar(rawNatural.S),
          C: normatizar(rawNatural.C),
        },
        bruto: { adaptado: rawAdaptado, natural: rawNatural },
        finalizadoEm: new Date().toISOString()
      };

      // Executa o POST para a API do backend sinalizando que o teste foi Finalizado (Status => CONCLUDED)
      try {
        await axios.post(`http://localhost:3001/api/disc/link/${token}/finalizar`);
      } catch (err) {
        console.warn('Erro ao finalizar o link no banco:', err);
      }

      // Simulando delay visual UX e Salvando no Cache (LocalStorage)
      await new Promise(r => setTimeout(r, 800));
      localStorage.setItem(`disc_resultado_${token}`, JSON.stringify(resultados));

      // Redireciona para os resultados públicos do candidato
      navigate(`/disc/responder/${token}/resultados`, { state: { resultados } });

    } catch (err) {
      alert('Erro ao processar as respostas. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // TELA DE AUTENTICAÇÃO / BOAS-VINDAS
  if (isObfuscatedError) {
    return (
      <div style={{ backgroundColor: '#fff', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', paddingTop: '8%', paddingLeft: '12%', fontFamily: 'sans-serif', color: '#202124' }}>
        <div style={{ maxWidth: '600px' }}>
          <h1 style={{ fontSize: '1.6em', fontWeight: 'normal', marginBottom: '16px' }}>Não é possível acessar esse site</h1>
          <p style={{ marginBottom: '22px', lineHeight: '1.5' }}>
            Não foi possível encontrar o endereço IP do servidor de <strong>{window.location.hostname}</strong>.
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '22px', marginBottom: '32px', lineHeight: '1.8' }}>
            <li>Verifique a conexão</li>
            <li>Verifique o proxy e o firewall</li>
          </ul>
          <p style={{ color: '#70757a', fontSize: '0.9em' }}>ERR_NAME_NOT_RESOLVED</p>
        </div>
      </div>
    );
  }

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
                : 'Por favor, informe seu Nome Completo e CPF para iniciar o teste.'}
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

            {/* Contexto: Candidato Externo (Nome e CPF) */}
            {!linkContext?.isEmployee && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={nomeCompleto}
                    onChange={e => setNomeCompleto(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Ex: Igor Gato"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">CPF (só números)</label>
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
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (linkContext?.isEmployee ? cpf.length < 11 : (nomeCompleto.length < 5 || cpf.length < 11))}
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
            const resp = respostas[q.pergunta] || {};
            const isCompleto = resp.mais && resp.menos;

            return (
              <div
                key={q.pergunta}
                className={`bg-gray-900 border rounded-2xl p-6 transition-all duration-300 ${isCompleto ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'border-gray-800'
                  }`}
              >
                <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                  <h3 className="text-xl font-bold text-white">Questão {q.pergunta}</h3>
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
                            name={`q${q.pergunta}_mais`}
                            checked={resp.mais === opcao.id}
                            onChange={() => handleSelectOpcao(q.pergunta, 'mais', opcao.id)}
                            className="w-5 h-5 text-blue-500 bg-gray-900 border-gray-700 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="sm:hidden text-sm text-blue-400 font-medium">+ Mais</span>
                        </label>

                        {/* Radio MENOS */}
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name={`q${q.pergunta}_menos`}
                            checked={resp.menos === opcao.id}
                            onChange={() => handleSelectOpcao(q.pergunta, 'menos', opcao.id)}
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
