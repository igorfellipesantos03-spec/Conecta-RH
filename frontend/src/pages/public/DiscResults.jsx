import { useLocation, useNavigate } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { DiscProfileAnalysis } from '../rh/DiscHub';

export default function DiscResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const rawRes = location.state?.resultados;

  const ambienteNatural = rawRes?.natural || rawRes?.ambienteNatural || { D: 85, I: 60, S: 30, C: 20 };
  const ambienteAdaptado = rawRes?.adaptado || rawRes?.ambienteAdaptado || { D: 75, I: 70, S: 40, C: 30 };

  const getPerfilName = (dados) => {
    let maxLetter = 'D';
    let maxVal = -1;
    for (const [k, v] of Object.entries(dados)) {
      if (v > maxVal) { maxVal = v; maxLetter = k; }
    }
    const map = {
      D: 'Dominância (Executor)',
      I: 'Influência (Comunicador)',
      S: 'Estabilidade (Planejador)',
      C: 'Conformidade (Analista)'
    };
    return map[maxLetter];
  };

  const perfilMestre = rawRes?.perfilMestre || getPerfilName(ambienteNatural);

  const dataNatural = [
    { subject: 'D (Dominância)', A: ambienteNatural.D, fullMark: 100 },
    { subject: 'I (Influência)', A: ambienteNatural.I, fullMark: 100 },
    { subject: 'S (Estabilidade)', A: ambienteNatural.S, fullMark: 100 },
    { subject: 'C (Conformidade)', A: ambienteNatural.C, fullMark: 100 },
  ];

  const dataAdaptado = [
    { subject: 'D (Dominância)', A: ambienteAdaptado.D, fullMark: 100 },
    { subject: 'I (Influência)', A: ambienteAdaptado.I, fullMark: 100 },
    { subject: 'S (Estabilidade)', A: ambienteAdaptado.S, fullMark: 100 },
    { subject: 'C (Conformidade)', A: ambienteAdaptado.C, fullMark: 100 },
  ];

  const renderProgressBar = (label, percentage, colorClass) => (
    <div className="mb-4" key={label}>
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm font-semibold text-gray-200">{label}</span>
        <span className="text-sm text-gray-400 font-mono">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden border border-gray-700">
        <div
          className={`h-2.5 rounded-full transition-all duration-1000 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-gray-100">

      {/* Header Fixo ConectaRH */}
      <header className="bg-blue-600 w-full sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-center">
          <h1 className="text-white text-xl font-bold tracking-wide">ConectaRH</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Bloco de Sucesso e Título */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Avaliação Concluída!</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Obrigado por responder o teste. Abaixo estão os resultados detalhados do seu perfil comportamental, baseados na metodologia DISC.
          </p>
        </div>

        {/* Destaque do Perfil */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center shadow-xl shadow-black/20 mb-10">
          <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-2">O Seu Perfil Predominante é</h3>
          <p className="text-2xl md:text-4xl font-extrabold text-blue-500 tracking-tight">
            {perfilMestre}
          </p>
        </div>

        {/* Gráficos e Barras */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

          {/* Ambiente Natural */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="border-b border-gray-800 pb-4 mb-6">
              <h3 className="text-xl font-semibold text-white">Ambiente Natural</h3>
              <p className="text-sm text-gray-500 mt-1">Como você reage instintivamente, sob pressão ou na sua essência.</p>
            </div>
            <div className="h-64 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dataNatural}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
                  <Radar name="Natural" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {renderProgressBar('Dominância (D)', ambienteNatural.D, 'bg-red-500')}
            {renderProgressBar('Influência (I)', ambienteNatural.I, 'bg-yellow-500')}
            {renderProgressBar('Estabilidade (S)', ambienteNatural.S, 'bg-green-500')}
            {renderProgressBar('Conformidade (C)', ambienteNatural.C, 'bg-blue-500')}
          </div>

          {/* Ambiente Adaptado */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="border-b border-gray-800 pb-4 mb-6">
              <h3 className="text-xl font-semibold text-white">Ambiente Adaptado</h3>
              <p className="text-sm text-gray-500 mt-1">Como você ajusta seu comportamento ao ambiente atual de trabalho.</p>
            </div>
            <div className="h-64 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dataAdaptado}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
                  <Radar name="Adaptado" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {renderProgressBar('Dominância (D)', ambienteAdaptado.D, 'bg-red-500')}
            {renderProgressBar('Influência (I)', ambienteAdaptado.I, 'bg-yellow-500')}
            {renderProgressBar('Estabilidade (S)', ambienteAdaptado.S, 'bg-green-500')}
            {renderProgressBar('Conformidade (C)', ambienteAdaptado.C, 'bg-blue-500')}
          </div>
        </div>

        {/* ── Análise do Perfil DISC ── */}
        <DiscProfileAnalysis resultado={rawRes} />

        {/* Botão */}
        <div className="flex justify-center mt-10">
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-8 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-1 cursor-pointer"
          >
            Voltar para o Início
          </button>
        </div>

      </main>
    </div>
  );
}
