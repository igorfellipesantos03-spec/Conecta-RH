import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';

// ──────────────────────────────────────────────
// CONSTANTES DE PERFIL DISC
// ──────────────────────────────────────────────
export const DISC_PROFILES = {
  D: {
    nome: 'Alto D — Dominância',
    cor: 'text-red-400',
    corBg: 'bg-red-500/10 border-red-500/20',
    corBarra: 'bg-red-500',
    emoji: '🔴',
    descricao: 'Perfil executor, direto e orientado a resultados. Toma decisões rápidas e aceita desafios.',
    valores: [
      'Obtendo resultados e delegando tarefas',
      'Aceitando desafios e tomando decisões',
      'Questionando o status quo e assumindo autoridade',
      'Criando soluções rápidas e inovadoras',
    ],
    pontosForca: 'Impulsionador natural, liderança proativa, capacidade de delegar e de agir sob pressão.',
    pontosMelhorar: 'Desenvolver mais paciência, consideração com sentimentos alheios e reconhecer resultados da equipe.',
    comunicacao: 'Direto, preciso e objetivo. Prefere comunicação escrita e vai direto ao ponto.',
    temores: 'Lentidão, dependência e excesso de jovialidade fora do seu controle.',
    tomadaDecisao: 'Rápida e enfática. Uma vez decidido, dificilmente muda de ideia.',
  },
  I: {
    nome: 'Alto I — Influência',
    cor: 'text-yellow-400',
    corBg: 'bg-yellow-500/10 border-yellow-500/20',
    corBarra: 'bg-yellow-500',
    emoji: '🟡',
    descricao: 'Perfil comunicador, entusiasta e orientado a relacionamentos. Motiva as pessoas ao seu redor.',
    valores: [
      'Criando impressões favoráveis e se comunicando',
      'Motivando pessoas e gerando entusiasmo',
      'Cultivando relacionamentos e demonstrando preocupação',
      'Influenciando pessoas a agir de forma positiva',
    ],
    pontosForca: 'Entusiasmo contagiante, elogios e otimismo. Grande habilidade de persuasão e criação de vínculos.',
    pontosMelhorar: 'Ter abordagem mais direta, controlar o tempo, trabalhar com dados analíticos e prazos realistas.',
    comunicacao: 'Natural e envolvente. Compartilha facilmente, mas pode ter dificuldade em guardar segredos.',
    temores: 'Ambiente fixo com pouca diversidade, perda de reconhecimento social e sentir-se em desvantagem.',
    tomadaDecisao: 'Impulsiva e rápida. Evita decisões impopulares e se preocupa com a opinião alheia.',
  },
  S: {
    nome: 'Alto S — Estabilidade',
    cor: 'text-green-400',
    corBg: 'bg-green-500/10 border-green-500/20',
    corBarra: 'bg-green-500',
    emoji: '🟢',
    descricao: 'Perfil estabilizador, consistente e focado em finalizar tarefas. Ouve atentamente e apoia a equipe.',
    valores: [
      'Desenvolvendo habilidades especializadas',
      'Estabilizando pessoas agitadas e apoiando os outros',
      'Mantendo consistência e persistindo nas tarefas',
      'Ouvindo atentamente e prestando serviço de qualidade',
    ],
    pontosForca: 'Determinação, consistência, organização e confiabilidade. Excelente finalizador de tarefas.',
    pontosMelhorar: 'Ter mais entusiasmo, flexibilidade, aceitação de outros estilos e usar métodos de atalho.',
    comunicacao: 'Quieto, calmo e gentil. Não fala mais que o necessário. Questiona e dá sugestões.',
    temores: 'Envolvimento pessoal muito rápido, exposição de ideias, mudanças bruscas e desorganização.',
    tomadaDecisao: 'Completa e demorada. Uma vez decidido, é difícil persuadi-lo a mudar.',
  },
  C: {
    nome: 'Alto C — Conformidade',
    cor: 'text-blue-400',
    corBg: 'bg-blue-500/10 border-blue-500/20',
    corBarra: 'bg-blue-500',
    emoji: '🔵',
    descricao: 'Perfil analista, preciso e orientado a qualidade. Toma decisões embasadas em dados e evidências.',
    valores: [
      'Concentrando no detalhe e operando em ambiente controlado',
      'Sendo diplomático e analisando problemas em profundidade',
      'Garantindo padrões e achando erros antes que aconteçam',
      'Pesquisando e assumindo problemas com responsabilidade',
    ],
    pontosForca: 'Exatidão, diplomacia, análise crítica e aderência a padrões de qualidade.',
    pontosMelhorar: 'Desenvolver consciência dos sentimentos, verbalizar emoções e trabalhar mais em equipe.',
    comunicacao: 'Observa a distância. Fala apenas o necessário. Questiona pela lógica e não se envolve em conversas informais.',
    temores: 'Emoções irracionais, ações não lógicas e perder a argumentação.',
    tomadaDecisao: 'Lenta e baseada em evidências. Quer decidir com perfeição, o que pode gerar paralisia.',
  },
};

// ──────────────────────────────────────────────
// HELPER: Análise do Perfil DISC
// ──────────────────────────────────────────────
export function DiscProfileAnalysis({ resultado }) {
  if (!resultado) return null;

  // ALTERADO: Usa Ambiente Adaptado em vez de Ambiente Natural para definir a personalidade dominante
  const adaptado = resultado.adaptado || resultado.ambienteAdaptado || {};
  if (!Object.keys(adaptado).length) return null;

  // Encontra a letra com maior pontuação no Ambiente Adaptado
  const dominante = Object.entries(adaptado).reduce(
    (max, [k, v]) => (v > max[1] ? [k, v] : max),
    ['D', -1]
  )[0];

  const perfil = DISC_PROFILES[dominante];
  if (!perfil) return null;

  return (
    <div className={`rounded-2xl border p-6 md:p-8 ${perfil.corBg} mt-8`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="text-3xl">{perfil.emoji}</div>
        <div>
          <h3 className={`text-xl font-bold ${perfil.cor}`}>{perfil.nome}</h3>
          <p className="text-gray-400 text-sm mt-0.5">{perfil.descricao}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
            ✦ Valores para a Organização
          </h4>
          <ul className="space-y-2">
            {perfil.valores.map((v, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${perfil.corBarra}`} />
                {v}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">💪 Pontos Fortes</h4>
            <p className="text-gray-300 text-sm">{perfil.pontosForca}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">📈 Pontos a Desenvolver</h4>
            <p className="text-gray-300 text-sm">{perfil.pontosMelhorar}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">💬 Estilo de Comunicação</h4>
            <p className="text-gray-300 text-sm">{perfil.comunicacao}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">⚡ Tomada de Decisão</h4>
            <p className="text-gray-300 text-sm">{perfil.tomadaDecisao}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">⚠️ Temores</h4>
            <p className="text-gray-300 text-sm">{perfil.temores}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// COMPONENTE: Conteúdo do Resultado DISC (Gráficos + Análise)
// ──────────────────────────────────────────────
export function DiscResultContent({ resultado, respostas = [] }) {
  if (!resultado) return null;

  const natural = resultado.natural || resultado.ambienteNatural || {};
  const adaptado = resultado.adaptado || resultado.ambienteAdaptado || {};

  const toRadarData = (obj) => [
    { subject: 'D (Dominância)', A: obj.D || 0, fullMark: 100 },
    { subject: 'I (Influência)', A: obj.I || 0, fullMark: 100 },
    { subject: 'S (Estabilidade)', A: obj.S || 0, fullMark: 100 },
    { subject: 'C (Conformidade)', A: obj.C || 0, fullMark: 100 },
  ];

  const renderBar = (label, pontuacao, colorClass) => (
    <div className="mb-3" key={label}>
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-sm text-gray-400 font-mono">{pontuacao}</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
        <div className={`h-2 rounded-full transition-all duration-700 ${colorClass}`} style={{ width: `${pontuacao}%` }} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Gráficos */}
      {(Object.keys(natural).length > 0 || Object.keys(adaptado).length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ambiente Natural */}
          {Object.keys(natural).length > 0 && (
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Ambiente Natural</h3>
              <div className="h-56 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={toRadarData(natural)}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
                    <Radar name="Natural" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.35} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              {renderBar('Dominância (D)', natural.D || 0, 'bg-red-500')}
              {renderBar('Influência (I)', natural.I || 0, 'bg-yellow-500')}
              {renderBar('Estabilidade (S)', natural.S || 0, 'bg-green-500')}
              {renderBar('Conformidade (C)', natural.C || 0, 'bg-blue-500')}
            </div>
          )}
          {/* Ambiente Adaptado */}
          {Object.keys(adaptado).length > 0 && (
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Ambiente Adaptado</h3>
              <div className="h-56 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={toRadarData(adaptado)}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
                    <Radar name="Adaptado" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.35} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              {renderBar('Dominância (D)', adaptado.D || 0, 'bg-red-500')}
              {renderBar('Influência (I)', adaptado.I || 0, 'bg-yellow-500')}
              {renderBar('Estabilidade (S)', adaptado.S || 0, 'bg-green-500')}
              {renderBar('Conformidade (C)', adaptado.C || 0, 'bg-blue-500')}
            </div>
          )}
        </div>
      )}

      {/* Análise do Perfil */}
      <DiscProfileAnalysis resultado={resultado} />

      {/* Respostas Selecionadas */}
      {respostas.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Respostas Selecionadas <span className="text-gray-500 text-sm font-normal">({respostas.length} questões)</span>
          </h3>
          <div className="bg-gray-950 border border-gray-800 rounded-xl divide-y divide-gray-800 max-h-72 overflow-y-auto">
            {respostas.map((resp, i) => (
              <div key={i} className="px-5 py-3 flex items-start gap-4">
                <span className="text-gray-600 font-mono text-sm w-6 flex-shrink-0">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  {resp.pergunta && <p className="text-gray-400 text-xs mb-0.5 truncate">{resp.pergunta}</p>}
                  <p className="text-gray-200 text-sm font-medium">{resp.resposta || resp.opcao || JSON.stringify(resp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
