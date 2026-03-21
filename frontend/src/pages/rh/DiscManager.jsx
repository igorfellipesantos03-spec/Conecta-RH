import { useState } from 'react';
import axios from 'axios';

// Lista de Empresas Holding (Mock Frontend)
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

export default function DiscManager() {
  const [isEmployee, setIsEmployee] = useState(true);
  const [companyId, setCompanyId] = useState('07'); // Default Conasa Infraestrutura
  const [branchId, setBranchId] = useState('01');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Regra de UI: Alterou empresa, verifica se precisa de branch manual
  const handleCompanyChange = (e) => {
    const cid = e.target.value;
    setCompanyId(cid);
    
    // Volta a filial para 01 se nao for as excecoes, apenas como segurança / reset
    if (cid !== '31' && cid !== '43') {
      setBranchId('01');
    } else {
      setBranchId('');
    }
  };

  const handleGerarLink = async (e) => {
    e.preventDefault();
    if (isEmployee && !companyId) return setError("Selecione a Empresa.");
    if (isEmployee && (companyId === '31' || companyId === '43') && !branchId) return setError("Digite a Filial (Branch ID).");

    setLoading(true);
    setError(null);
    setCopySuccess(false);

    try {
      const response = await axios.post('http://localhost:3001/api/disc/generate-link', {
        isEmployee,
        // Se isEmployee for false, no back-end também será gravado o branch '01' e company '07' como padrao,
        // mas a busca de protheus ignora por causa da flag
        companyId: isEmployee ? companyId : '07',
        branchId: isEmployee ? branchId : '01',
      });

      if (response.data.sucesso) {
        setGeneratedLink(response.data.link);
      } else {
        setError(response.data.mensagem || "Erro na solicitação");
      }
    } catch (err) {
      setError(err.response?.data?.erro || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  const needsBranchInput = companyId === '31' || companyId === '43';

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-gray-100 p-6 lg:p-12">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Intro */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Gerenciador DISC
          </h1>
          <p className="text-gray-400">
            Gere links únicos de convite para avaliações do Perfil Comportamental. O sistema cuidará das regras de conexão com o Protheus automaticamente.
          </p>
        </div>

        <form onSubmit={handleGerarLink} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 mb-8 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-6">Configuração do Convite</h2>

          {/* Toggle "É funcionário?" */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-400 mb-3">
              É para um funcionário atual (Já cadastrado no Protheus)?
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="isEmployee" 
                  checked={isEmployee === true} 
                  onChange={() => setIsEmployee(true)}
                  className="w-4 h-4 text-blue-600 bg-gray-950 border-gray-700" 
                />
                <span className="text-gray-200 text-sm">Sim, funcionário</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="isEmployee" 
                  checked={isEmployee === false} 
                  onChange={() => setIsEmployee(false)}
                  className="w-4 h-4 text-blue-600 bg-gray-950 border-gray-700" 
                />
                <span className="text-gray-200 text-sm">Não, candidato externo</span>
              </label>
            </div>
          </div>

          {/* Empresa e Filial (Somente se for Funcinario) */}
          {isEmployee && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-t border-gray-800 pt-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Empresa Holding *
                </label>
                <select
                  value={companyId}
                  onChange={handleCompanyChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {empresasList.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.id} - {emp.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Filial (Branch ID) *
                </label>
                {needsBranchInput ? (
                  <input
                    type="text"
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    placeholder="Ex: 02"
                    required
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                ) : (
                  <input
                    type="text"
                    value="01"
                    disabled
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 px-4 text-gray-500 cursor-not-allowed opacity-70"
                  />
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {needsBranchInput ? "Esta empresa possui flexibilidade de filial." : "A filial padrão para esta empresa é 01."}
                </p>
              </div>

            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 min-w-[200px]"
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                'Gerar Link DISC'
              )}
            </button>
          </div>
        </form>

        {/* Card do Link Gerado */}
        {generatedLink && (
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-2xl p-6 animate-fade-in-up">
            <h3 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Link gerado com sucesso!
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Envie este link para o participante. Quando ele(a) acessar e preencher o CPF, o sistema analisará automaticamente as regras do Protheus com base na empresa selecionada.
            </p>
            
            <div className="flex items-center gap-3">
              <input
                type="text"
                readOnly
                value={generatedLink}
                className="flex-1 bg-gray-950 border border-gray-800 rounded-lg py-3 px-4 text-emerald-300 font-mono text-sm focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-3 rounded-lg border border-gray-700 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                {copySuccess ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Copiado
                  </span>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Copiar
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
