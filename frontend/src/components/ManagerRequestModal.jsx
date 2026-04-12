import { useState, useEffect } from 'react';
import axios from 'axios';

// Lista de Empresas da Holding (mesma do Sidebar)
const EMPRESAS = [
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

// Empresas que precisam de filial manual
const FILIAL_MANUAL = ['31', '43'];

export default function ManagerRequestModal({ onClose, onSuccess }) {
  // Passo 1: Empresa + Filial
  const [empresaId, setEmpresaId] = useState('');
  const [filialId, setFilialId] = useState('01');

  // Passo 2: Departamentos
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [selectedDepts, setSelectedDepts] = useState([]);

  // Passo 3: Justificativa + Submissão
  const [justification, setJustification] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const needsManualFilial = FILIAL_MANUAL.includes(empresaId);

  // Quando empresa/filial mudam, limpa seleção e busca centros de custo
  useEffect(() => {
    if (!empresaId || (!filialId && !needsManualFilial)) return;
    if (needsManualFilial && !filialId) return;

    setSelectedDepts([]);
    setDepartments([]);
    setLoadingDepts(true);
    setError(null);

    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem('@ConectaRH:access_token');
        const res = await axios.get('https://conectarh.conasa.com/api/access/departments', {
          params: { empresaId, filialId },
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setDepartments(res.data.data || []);
        }
      } catch (err) {
        setError('Erro ao buscar departamentos. Tente novamente.');
      } finally {
        setLoadingDepts(false);
      }
    };

    fetchDepartments();
  }, [empresaId, filialId]);

  const handleEmpresaChange = (id) => {
    setEmpresaId(id);
    if (!FILIAL_MANUAL.includes(id)) {
      setFilialId('01');
    } else {
      setFilialId('');
    }
  };

  const handleToggleDept = (dept) => {
    setSelectedDepts(prev => {
      const deptCode = (dept.departmentCode || dept.costCenterCode || '').trim();
      const deptDesc = dept.departmentDescription || dept.costCenterDescription || '';
      const exists = prev.find(d => d.code === deptCode);
      if (exists) return prev.filter(d => d.code !== deptCode);
      return [...prev, { code: deptCode, name: deptDesc }];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedDepts.length === 0) {
      return setError('Selecione pelo menos um setor.');
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('@ConectaRH:access_token');
      const response = await axios.post(
        'https://conectarh.conasa.com/api/access/request',
        {
          requestedDepts: selectedDepts,
          justification,
          requestedEmpresaId: empresaId,
          requestedFilialId: filialId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        onSuccess(response.data.message);
        onClose();
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao enviar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const empresaLabel = EMPRESAS.find(e => e.id === empresaId)?.label || '';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">Solicitar Acesso de Gestor</h2>
            <p className="text-gray-400 text-sm mt-0.5">Selecione sua empresa, filial e os setores que deseja gerenciar</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Empresa */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Empresa</label>
              <select
                value={empresaId}
                onChange={(e) => handleEmpresaChange(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="">Selecione a empresa...</option>
                {EMPRESAS.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.label}</option>
                ))}
              </select>
            </div>

            {/* Filial */}
            {empresaId && needsManualFilial && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Código da Filial</label>
                <input
                  type="text"
                  value={filialId}
                  onChange={(e) => setFilialId(e.target.value)}
                  placeholder="Ex: 01, 02..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}

            {empresaId && filialId && !needsManualFilial && (
              <div className="text-xs text-gray-500 -mt-3">
                Filial: <span className="text-gray-400">{filialId}</span>
              </div>
            )}

            {/* Centros de Custo */}
            {empresaId && filialId && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Setores Disponíveis
                  {empresaLabel && <span className="text-gray-500 font-normal"> — {empresaLabel}</span>}
                </label>

                {loadingDepts ? (
                  <div className="flex items-center justify-center py-8 text-gray-500 text-sm">
                    <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Buscando setores...
                  </div>
                ) : departments.length === 0 ? (
                  <div className="border border-dashed border-gray-800 rounded-xl p-6 text-center">
                    <p className="text-gray-500 text-sm">
                      Nenhum setor encontrado para esta empresa/filial.
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      Os setores são cadastrados automaticamente quando DISCs são concluídos.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-1">
                    {departments.map(dept => {
                      const deptCode = (dept.departmentCode || dept.costCenterCode || '').trim();
                      const deptDesc = dept.departmentDescription || dept.costCenterDescription || '';
                      const isSelected = selectedDepts.some(d => d.code === deptCode);
                      return (
                        <div
                          key={dept.id}
                          onClick={() => handleToggleDept(dept)}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${
                            isSelected
                              ? 'bg-blue-600/10 border-blue-500/50'
                              : 'bg-gray-900 border-gray-800 hover:border-gray-700 hover:bg-gray-800/60'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-600 bg-gray-950'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                              {deptDesc}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate mt-0.5">
                              Código: {deptCode}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Justificativa */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Justificativa (Opcional)
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Ex: Assumi a gerência do setor recentemente..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors h-24 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 bg-gray-900/50 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedDepts.length === 0 || !empresaId || !filialId}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-medium text-sm py-2.5 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                Enviando...
              </>
            ) : `Enviar Solicitação(${selectedDepts.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
