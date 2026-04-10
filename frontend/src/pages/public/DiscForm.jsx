import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * Mapeamento oficial DISC baseado na planilha de cálculo.
 * Cada questão tem mapeamentos DIFERENTES para MAIS e MENOS.
 * '-' significa que aquela alternativa NÃO pontua nada (é descartada do cálculo).
 */
export const DISC_MAPPING = {
  1: { MAIS: { A: 'S', B: 'I', C: 'C', D: '-' }, MENOS: { A: 'S', B: '-', C: 'C', D: 'D' } },
  2: { MAIS: { A: 'I', B: 'C', C: 'D', D: '-' }, MENOS: { A: 'I', B: 'C', C: 'D', D: 'S' } },
  3: { MAIS: { A: '-', B: 'D', C: 'S', D: 'I' }, MENOS: { A: 'C', B: 'D', C: '-', D: 'I' } },
  4: { MAIS: { A: 'C', B: 'S', C: '-', D: 'I' }, MENOS: { A: '-', B: 'S', C: 'D', D: 'I' } },
  5: { MAIS: { A: '-', B: 'C', C: '-', D: 'S' }, MENOS: { A: 'I', B: 'C', C: 'D', D: 'S' } },
  6: { MAIS: { A: 'D', B: 'S', C: '-', D: '-' }, MENOS: { A: 'D', B: 'S', C: 'I', D: 'C' } },
  7: { MAIS: { A: '-', B: 'S', C: 'D', D: 'I' }, MENOS: { A: 'C', B: '-', C: 'D', D: 'I' } },
  8: { MAIS: { A: 'D', B: 'I', C: '-', D: '-' }, MENOS: { A: '-', B: '-', C: 'S', D: 'C' } },
  9: { MAIS: { A: 'I', B: 'S', C: 'D', D: 'C' }, MENOS: { A: 'I', B: 'S', C: 'D', D: 'C' } },
  10: { MAIS: { A: 'D', B: 'C', C: '-', D: 'S' }, MENOS: { A: 'D', B: '-', C: 'I', D: 'S' } },
  11: { MAIS: { A: 'I', B: 'S', C: '-', D: 'D' }, MENOS: { A: 'I', B: 'S', C: '-', D: 'D' } },
  12: { MAIS: { A: '-', B: 'D', C: 'C', D: 'S' }, MENOS: { A: 'I', B: 'D', C: '-', D: 'S' } },
  13: { MAIS: { A: 'D', B: 'I', C: 'S', D: '-' }, MENOS: { A: '-', B: 'I', C: 'S', D: 'C' } },
  14: { MAIS: { A: 'C', B: 'D', C: 'I', D: 'S' }, MENOS: { A: 'C', B: '-', C: 'I', D: '-' } },
  15: { MAIS: { A: 'S', B: '-', C: 'C', D: '-' }, MENOS: { A: '-', B: '-', C: 'C', D: 'D' } },
  16: { MAIS: { A: 'I', B: '-', C: '-', D: 'D' }, MENOS: { A: '-', B: 'S', C: 'C', D: 'D' } },
  17: { MAIS: { A: 'C', B: 'S', C: '-', D: 'D' }, MENOS: { A: '-', B: 'S', C: 'I', D: 'D' } },
  18: { MAIS: { A: 'I', B: 'S', C: '-', D: 'D' }, MENOS: { A: '-', B: '-', C: 'C', D: 'D' } },
  19: { MAIS: { A: 'C', B: 'D', C: 'I', D: 'S' }, MENOS: { A: '-', B: 'D', C: 'I', D: 'S' } },
  20: { MAIS: { A: 'D', B: 'C', C: '-', D: 'I' }, MENOS: { A: 'D', B: '-', C: 'S', D: 'I' } },
  21: { MAIS: { A: 'S', B: '-', C: 'D', D: 'C' }, MENOS: { A: 'I', B: 'S', C: 'D', D: 'C' } },
  22: { MAIS: { A: 'I', B: '-', C: 'D', D: 'S' }, MENOS: { A: 'I', B: 'C', C: 'D', D: 'S' } },
  23: { MAIS: { A: 'I', B: 'C', C: 'D', D: '-' }, MENOS: { A: 'I', B: '-', C: 'D', D: 'S' } },
  24: { MAIS: { A: 'D', B: 'S', C: 'I', D: 'C' }, MENOS: { A: 'D', B: 'S', C: 'I', D: 'C' } }
};

export const questoesDISC = [
  {
    pergunta: 1,
    opcoes: [
      { id: 'A', texto: 'amável, gentil' },
      { id: 'B', texto: 'persuasivo, convincente' },
      { id: 'C', texto: 'humilde, reservado, modesto' },
      { id: 'D', texto: 'original, inovador, diferente' },
    ]
  },
  {
    pergunta: 2,
    opcoes: [
      { id: 'A', texto: 'atrativo, simpático, agradável para os demais' },
      { id: 'B', texto: 'cooperativo, está de acordo com freqüência' },
      { id: 'C', texto: 'teimoso, tenaz, combativo' },
      { id: 'D', texto: 'doce, complacente' },
    ]
  },
  {
    pergunta: 3,
    opcoes: [
      { id: 'A', texto: 'facilmente lidera, independente' },
      { id: 'B', texto: 'divertido, adora dar risadas' },
      { id: 'C', texto: 'leal, aapegado' },
      { id: 'D', texto: 'encantador, doce' },
    ]
  },
  {
    pergunta: 4,
    opcoes: [
      { id: 'A', texto: 'mente aberta, receptivo' },
      { id: 'B', texto: 'reconhecido pelos demais, gosta de ajudar' },
      { id: 'C', texto: 'voluntarioso, caráter forte e decidido' },
      { id: 'D', texto: 'alegre, divertido' },
    ]
  },
  {
    pergunta: 5,
    opcoes: [
      { id: 'A', texto: 'jovial, gosta de alegrar as pessoas' },
      { id: 'B', texto: 'preciso, exato' },
      { id: 'C', texto: 'decidido, determinado, audaz' },
      { id: 'D', texto: 'estável, de temperamento tranqüilo, calmo' },
    ]
  },
  {
    pergunta: 6,
    opcoes: [
      { id: 'A', texto: 'competitivo, busca ganhar' },
      { id: 'B', texto: 'carinhoso, tem muito tato' },
      { id: 'C', texto: 'extrovertido, gosta de divertir-se' },
      { id: 'D', texto: 'harmonioso, busca o acordo' },
    ]
  },
  {
    pergunta: 7,
    opcoes: [
      { id: 'A', texto: 'exigente, difícil de satisfazer' },
      { id: 'B', texto: 'obediente, faz o que lhe pedem que faça, comedido' },
      { id: 'C', texto: 'tenaz e decidido, determinado' },
      { id: 'D', texto: 'brincalhão, divertido' },
    ]
  },
  {
    pergunta: 8,
    opcoes: [
      { id: 'A', texto: 'valente, temerário, cheio de coragem' },
      { id: 'B', texto: 'inspirador, estimulante, motivador' },
      { id: 'C', texto: 'obediente, não confronta, cede facilmente' },
      { id: 'D', texto: 'tímido, apreensivo, calado' },
    ]
  },
  {
    pergunta: 9,
    opcoes: [
      { id: 'A', texto: 'sociável, desfruta da companhia dos outros' },
      { id: 'B', texto: 'paciente, estável, tolerante' },
      { id: 'C', texto: 'auto-suficiente, independente' },
      { id: 'D', texto: 'reservado' },
    ]
  },
  {
    pergunta: 10,
    opcoes: [
      { id: 'A', texto: 'aventureiro, desejoso de arriscar-se' },
      { id: 'B', texto: 'receptivo, aberto a sugestões' },
      { id: 'C', texto: 'cordial, cálido, amistoso' },
      { id: 'D', texto: 'moderado, evita os extremos' },
    ]
  },
  {
    pergunta: 11,
    opcoes: [
      { id: 'A', texto: 'expressivo, fala muito' },
      { id: 'B', texto: 'controlado, pouco expressivo' },
      { id: 'C', texto: 'convencional, sistemático, gosta da rotina' },
      { id: 'D', texto: 'decidido, certo, firme ao tomar decisões' },
    ]
  },
  {
    pergunta: 12,
    opcoes: [
      { id: 'A', texto: 'refinado, elegante ao falar' },
      { id: 'B', texto: 'busca desafios, assume riscos' },
      { id: 'C', texto: 'diplomático, tem tato com as pessoas' },
      { id: 'D', texto: 'satisfeito, contente, confortável' },
    ]
  },
  {
    pergunta: 13,
    opcoes: [
      { id: 'A', texto: 'agressivo, desafiante, enfocado na ação ou objetivo' },
      { id: 'B', texto: 'alma da festa, divertido, extrovertido' },
      { id: 'C', texto: 'ingênuo, é fácil que se aproveitem dele' },
      { id: 'D', texto: 'temeroso, tende a preocupar-se muito' },
    ]
  },
  {
    pergunta: 14,
    opcoes: [
      { id: 'A', texto: 'cuidadoso, desconfiado, cauteloso' },
      { id: 'B', texto: 'determinado, decidido, não desiste, se põe firme' },
      { id: 'C', texto: 'convincente, transmite segurança' },
      { id: 'D', texto: 'de bom caráter, cortês, gosta de satisfazer os demais' },
    ]
  },
  {
    pergunta: 15,
    opcoes: [
      { id: 'A', texto: 'entusiasta, se envolve com o que faz' },
      { id: 'B', texto: 'impaciente, ansioso, desesperado às vezes' },
      { id: 'C', texto: 'amistoso, consegue acordos, aceita' },
      { id: 'D', texto: 'animado, vivaz, entusiasta' },
    ]
  },
  {
    pergunta: 16,
    opcoes: [
      { id: 'A', texto: 'tem autoconfiança, crê em si mesmo, seguro' },
      { id: 'B', texto: 'compreensivo, compassivo, apoiador das pessoas' },
      { id: 'C', texto: 'tolerante' },
      { id: 'D', texto: 'assertivo, agressivo, direto' },
    ]
  },
  {
    pergunta: 17,
    opcoes: [
      { id: 'A', texto: 'muito disciplinado, auto controlado' },
      { id: 'B', texto: 'generoso, gosta de compartilhar' },
      { id: 'C', texto: 'animado, expressivo, usa muitos gestos' },
      { id: 'D', texto: 'persistente, não volta atrás, se nega a perder' },
    ]
  },
  {
    pergunta: 18,
    opcoes: [
      { id: 'A', texto: 'admirável, digno de reconhecimento' },
      { id: 'B', texto: 'amável, desejoso de ajudar e de compartilhar' },
      { id: 'C', texto: 'resignado, desiste, não luta' },
      { id: 'D', texto: 'caráter forte, poderoso' },
    ]
  },
  {
    pergunta: 19,
    opcoes: [
      { id: 'A', texto: 'respeitoso, trata as pessoas com consideração' },
      { id: 'B', texto: 'pioneiro, explorador, inovador' },
      { id: 'C', texto: 'otimista, vê o lado positivo de tudo' },
      { id: 'D', texto: 'se acomoda, complacente, pronto para ajudar' },
    ]
  },
  {
    pergunta: 20,
    opcoes: [
      { id: 'A', texto: 'gosta de discutir, controverso, confrontante' },
      { id: 'B', texto: 'adaptável, flexível' },
      { id: 'C', texto: 'relaxado, leva as coisas com calma, tranqüilo' },
      { id: 'D', texto: 'leve, despreocupado, descomplicado' },
    ]
  },
  {
    pergunta: 21,
    opcoes: [
      { id: 'A', texto: 'confia nos demais, tem fé nas pessoas' },
      { id: 'B', texto: 'contente, satisfeito' },
      { id: 'C', texto: 'positivo, não admite dúvidas nem temores' },
      { id: 'D', texto: 'pacífico, tranqüilo' },
    ]
  },
  {
    pergunta: 22,
    opcoes: [
      { id: 'A', texto: 'socialmente hábil, gosta de estar com os demais' },
      { id: 'B', texto: 'educado, culto, conhecedor' },
      { id: 'C', texto: 'vigoroso, enérgico' },
      { id: 'D', texto: 'tolerante, pouco exato, compreensivo' },
    ]
  },
  {
    pergunta: 23,
    opcoes: [
      { id: 'A', texto: 'agradável, sua companhia é prazerosa' },
      { id: 'B', texto: 'exato, correto, preciso' },
      { id: 'C', texto: 'tem opiniões claras, fala livre e abertamente' },
      { id: 'D', texto: 'reservado, controlado' },
    ]
  },
  {
    pergunta: 24,
    opcoes: [
      { id: 'A', texto: 'impaciente, não se permite relaxar, não descansa' },
      { id: 'B', texto: 'sociável, amável' },
      { id: 'C', texto: 'popular, apreciado por muitas pessoas' },
      { id: 'D', texto: 'ordenado, organizado, claro' },
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
        const response = await axios.get(`https://conectarh.conasa.com/api/disc/link/${token}`);
        if (response.data.sucesso) {
          setLinkContext(response.data.dados);
          if (response.data.dados.status === 'EXPIRED') {
            setIsObfuscatedError(true);
            setLinkError('Este link do teste DISC já expirou ou foi utilizado.');
          }
        } else {
          setLinkError(response.data.mensagem);
        }
      } catch (err) {
        if (err.response && (err.response.status === 404 || err.response.status === 410)) {
          setIsObfuscatedError(true);
          setLinkError(err.response.data?.mensagem || 'Este link já expirou ou não existe.');
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
        const response = await axios.get(`https://conectarh.conasa.com/api/employees/check-cpf/${cpf}?token=${token}`);
        if (response.data.sucesso) {
          // Dispara também o POST pro nosso backend para registrar que iniciou (PROGRESS) e salvar o CPF/Nome
          try {
            await axios.post(`https://conectarh.conasa.com/api/disc/link/${token}/iniciar`, {
              nome: response.data.dados.name || response.data.dados.nome || 'Funcionário',
              cpf: cpf
            });
          } catch (err) {
            console.warn('Erro ao atualizar status para PROGRESS:', err);
          }

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
      try {
        await axios.post(`https://conectarh.conasa.com/api/disc/link/${token}/iniciar`, {
          nome: nomeCompleto.trim(),
          cpf: cpf
        });
        setColaborador({ nome: nomeCompleto, cpf: cpf });
        setIsUserValidated(true);
      } catch (err) {
        setError(err.response?.data?.mensagem || 'Erro ao iniciar o teste.');
      }
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
          const mapping = DISC_MAPPING[q.pergunta];

          // MAIS -> Ambiente Adaptado (usa o mapeamento MAIS da questão)
          if (resp.mais && mapping) {
            const letraMais = mapping.MAIS[resp.mais];
            if (letraMais && letraMais !== '-') {
              rawAdaptado[letraMais] += 1;
            }
          }

          // MENOS -> Ambiente Natural (usa o mapeamento MENOS da questão)
          if (resp.menos && mapping) {
            const letraMenos = mapping.MENOS[resp.menos];
            if (letraMenos && letraMenos !== '-') {
              rawNatural[letraMenos] += 1;
            }
          }
        }
      });

      // Tabela de conversão oficial DISC (índice = contagem bruta da letra)
      // ADAPTADO: quanto MAIS a letra aparece, MAIOR a pontuação
      const ADAPTED_TABLE = {
        D: [5, 15, 24, 34, 38, 43, 48, 54, 59, 65, 74, 76, 79, 83, 85, 94, 97, 97, 97, 97, 100, 100],
        I: [8, 20, 35, 43, 57, 68, 73, 82, 87, 91, 96, 96, 96, 96, 96, 96, 96, 100, 100, 100, 100, 100],
        S: [11, 21, 30, 38, 45, 55, 60, 77, 75, 79, 85, 89, 96, 96, 96, 96, 96, 96, 96, 100, 100, 100],
        C: [0, 16, 30, 40, 55, 66, 73, 85, 87, 97, 97, 97, 97, 97, 96, 100, 100, 100, 100, 100, 100, 100],
      };

      // NATURAL: quanto MENOS a letra aparece, MAIOR a pontuação (lógica inversa)
      const NATURAL_TABLE = {
        D: [100, 87, 75, 67, 60, 54, 47, 42, 40, 32, 28, 25, 22, 15, 11, 8, 5, 5, 5, 5, 5, 2],
        I: [100, 86, 75, 67, 55, 47, 37, 28, 22, 15, 10, 8, 8, 8, 8, 8, 8, 8, 5, 0, 0, 0],
        S: [100, 97, 85, 75, 68, 60, 53, 42, 37, 28, 23, 16, 8, 5, 5, 5, 5, 5, 5, 2, 2, 2],
        C: [100, 97, 83, 75, 66, 58, 52, 45, 38, 33, 23, 15, 7, 5, 5, 5, 0, 0, 0, 0, 0, 0],
      };

      const lookupScore = (table, letra, count) => {
        const arr = table[letra];
        if (!arr) return 0;
        const idx = Math.min(count, arr.length - 1);
        return arr[idx];
      };

      const resultados = {
        adaptado: {
          D: lookupScore(ADAPTED_TABLE, 'D', rawAdaptado.D),
          I: lookupScore(ADAPTED_TABLE, 'I', rawAdaptado.I),
          S: lookupScore(ADAPTED_TABLE, 'S', rawAdaptado.S),
          C: lookupScore(ADAPTED_TABLE, 'C', rawAdaptado.C),
        },
        natural: {
          D: lookupScore(NATURAL_TABLE, 'D', rawNatural.D),
          I: lookupScore(NATURAL_TABLE, 'I', rawNatural.I),
          S: lookupScore(NATURAL_TABLE, 'S', rawNatural.S),
          C: lookupScore(NATURAL_TABLE, 'C', rawNatural.C),
        },
        bruto: { adaptado: rawAdaptado, natural: rawNatural },
        finalizadoEm: new Date().toISOString()
      };

      // Executa o POST para a API do backend sinalizando que o teste foi Finalizado (Status => CONCLUDED)
      try {
        await axios.post(`https://conectarh.conasa.com/api/disc/link/${token}/finalizar`, {
          respostas: Object.values(respostas),
          resultado: resultados,
          departamentCode: colaborador?.costCenterDescription
        });
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
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-gray-100 font-sans">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Acesso Indisponível</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            {linkError || 'Este link já expirou, foi preenchido anteriormente ou não existe mais.'}
          </p>
          <div className="pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-500">
              Se você acredita que isso é um erro, por favor,<br />
              entre em contato com o departamento de Recursos Humanos.
            </p>
          </div>
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
