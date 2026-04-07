import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, BookOpen, FileCheck, LogOut, UserPlus, X, Shield, ShieldCheck, User } from 'lucide-react';
import api from '../services/api';

// Lista de Empresas da Holding
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

/**
 * Lê o usuário autenticado e sua role do localStorage.
 * Retorna o objeto { username, name, role, departamentCode, empresaId, filialId } ou defaults vazios.
 */
function useCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('@ConectaRH:user') || '{}');
  } catch {
    return {};
  }
}

/** Badge colorida exibindo a role do usuário no rodapé da sidebar */
function RoleBadge({ role }) {
  const styles = {
    ADMIN:  'bg-purple-500/15 text-purple-400 border-purple-500/25',
    RH:     'bg-blue-500/15   text-blue-400   border-blue-500/25',
    GESTOR: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    USER:   'bg-gray-500/15   text-gray-400   border-gray-500/25',
  };
  const labels = { ADMIN: 'Administrador', RH: 'Recursos Humanos', GESTOR: 'Gestor', USER: 'Colaborador' };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${styles[role] || 'bg-gray-700 text-gray-400'}`}>
      {labels[role] || role}
    </span>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const rawRole = currentUser.role || '';

  // Mapeamento de roles legadas para o novo sistema RBAC.
  const ROLE_MAP = {
    'ADMIN': 'ADMIN',
    'RH': 'RH',
    'GESTOR': 'GESTOR',
    'USER': 'USER',
    // valores antigos do banco:
    'TI': 'ADMIN',
    'Recursos Humanos': 'RH',
    'recursos humanos': 'RH',
  };
  const userRole = ROLE_MAP[rawRole] || 'USER';

  // Modal de Adicionar Usuário
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState('RH');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newEmpresaId, setNewEmpresaId] = useState('07');
  const [newFilialId, setNewFilialId] = useState('01');
  const [addMessage, setAddMessage] = useState(null);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  // Busca a quantidade de aprovações pendentes (se for ADMIN ou RH)
  useEffect(() => {
    if (userRole === 'ADMIN' || userRole === 'RH') {
      const fetchPending = async () => {
        try {
          const res = await api.get('/access/requests');
          if (res.data.success) {
            const pending = (res.data.data || []).filter(r => r.status === 'PENDING');
            setPendingApprovalsCount(pending.length);
          }
        } catch (e) {
          // Silent fail on badge info
        }
      };
      fetchPending();
      
      const interval = setInterval(fetchPending, 30000); // refresh every 30s
      return () => clearInterval(interval);
    }
  }, [userRole]);

  // Empresas que precisam de filial manual
  const needsBranchInput = newEmpresaId === '31' || newEmpresaId === '43';

  const handleEmpresaChange = (cid) => {
    setNewEmpresaId(cid);
    if (cid !== '31' && cid !== '43') {
      setNewFilialId('01');
    } else {
      setNewFilialId('');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddMessage(null);
    if (!newUsername.trim()) return;
    if (!newEmpresaId) return setAddMessage({ type: 'error', text: 'Selecione a empresa.' });
    if (!needsBranchInput && !newFilialId) return setAddMessage({ type: 'error', text: 'Informe a filial.' });

    setLoadingAdd(true);
    try {
      const payload = {
        username: newUsername,
        role: newRole,
        empresaId: newEmpresaId,
        filialId: newFilialId
      };
      if (newDeptCode.trim()) payload.departamentCode = newDeptCode;

      const resp = await api.post('/users', payload);
      if (resp.data.success) {
        setAddMessage({ type: 'success', text: resp.data.message || 'Usuário adicionado!' });
        setNewUsername('');
        setNewRole('RH');
        setNewDeptCode('');
        setNewEmpresaId('07');
        setNewFilialId('01');
        setTimeout(() => setIsAddUserModalOpen(false), 2000);
      } else {
        setAddMessage({ type: 'error', text: resp.data.error || 'Erro ao adicionar' });
      }
    } catch (err) {
      setAddMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao conectar com o servidor.' });
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('@ConectaRH:access_token');
    localStorage.removeItem('@ConectaRH:refresh_token');
    localStorage.removeItem('@ConectaRH:user');
    navigate('/rh/login');
  };

  // ── Itens do menu filtrados por role ──────────────────────────────
  const allNavItems = [
    { name: 'Hub Principal',  path: '/',                    icon: <Home        className="w-5 h-5" />, roles: ['ADMIN','RH','GESTOR','USER'] },
    { name: 'Meu DISC',       path: '/rh/meu-disc',         icon: <User        className="w-5 h-5" />, roles: ['ADMIN','RH','GESTOR','USER'] },
    { name: 'Treinamentos',   path: '/em-desenvolvimento',  icon: <BookOpen    className="w-5 h-5" />, roles: ['ADMIN','RH'] },
    { name: 'Gerador DISC',   path: '/rh/disc-manager',     icon: <FileCheck   className="w-5 h-5" />, roles: ['ADMIN','RH'] },
    { name: 'DISC da Equipe', path: '/rh/disc-hub',         icon: <FileCheck   className="w-5 h-5" />, roles: ['GESTOR'] },
    { name: 'Aprovações',     path: '/rh/access-approvals', icon: <ShieldCheck className="w-5 h-5" />, roles: ['ADMIN','RH'] }
  ];
  const navItems = allNavItems.filter(i => i.roles.includes(userRole));

  // Nome da empresa do usuário logado
  const userEmpresaLabel = empresasList.find(e => e.id === currentUser.empresaId)?.label || '';

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen sticky top-0">
      {/* Topo / Logo */}
      <div className="h-20 flex items-center justify-center border-b border-gray-800 px-6">
        <img src="/logo.png" alt="ConectaRH" className="h-10 object-contain drop-shadow-md" />
      </div>

      {/* Menu Principal */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">Menu Principal</div>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all ${isActive
                ? 'bg-blue-600/10 text-blue-500 hover:bg-blue-600/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`
            }
          >
            <div className="flex items-center gap-3">
              {item.icon}
              {item.name}
            </div>
            
            {item.name === 'Aprovações' && pendingApprovalsCount > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.6)] text-white text-[10px] font-bold animate-pulse px-1.5 leading-none mt-0.5">
                {pendingApprovalsCount}
              </span>
            )}
          </NavLink>
        ))}

        {/* Botão "Adicionar Usuário" — apenas ADMIN */}
        {userRole === 'ADMIN' && (
          <>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-3 px-3">Administração</div>
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 w-full text-left cursor-pointer"
            >
              <UserPlus className="w-5 h-5" />
              Gerenciar Usuários
            </button>
          </>
        )}
      </nav>

      {/* Rodapé — perfil + logout */}
      <div className="p-4 border-t border-gray-800 space-y-3">
        {/* Info do usuário autenticado */}
        <div className="px-3 py-2 rounded-lg bg-gray-800/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-white font-medium truncate">{currentUser.name || currentUser.username || 'Usuário'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <RoleBadge role={userRole} />
              {userEmpresaLabel && (
                <span className="text-[10px] text-gray-500 truncate max-w-[80px]">{userEmpresaLabel}</span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium w-full text-left text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          Sair do Sistema
        </button>
      </div>

      {/* Modal: Gerenciar Usuário (ADMIN only) */}
      {isAddUserModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddUserModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Novo Usuário</h3>
            <p className="text-sm text-gray-400 mb-6">Libere o acesso ao ConectaRH, defina o perfil e a empresa.</p>

            <form onSubmit={handleAddUser} className="space-y-4">
              {/* Login de Rede */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Login de Rede</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Ex: joao.silva"
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Perfil de Acesso */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Perfil de Acesso</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="RH">RH — Acesso Operacional Completo</option>
                  <option value="ADMIN">Administrador — Acesso Total</option>
                </select>
              </div>

              {/* Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Empresa <span className="text-red-400">*</span>
                </label>
                <select
                  value={newEmpresaId}
                  onChange={(e) => handleEmpresaChange(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                >
                  {empresasList.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.id} - {emp.label}</option>
                  ))}
                </select>
              </div>

              {/* Filial */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Filial {needsBranchInput ? <span className="text-gray-500 text-xs font-normal ml-1">(opcional para acesso a todas)</span> : <span className="text-red-400">*</span>}
                </label>
                {needsBranchInput ? (
                  <input
                    type="text"
                    value={newFilialId}
                    onChange={(e) => setNewFilialId(e.target.value)}
                    placeholder="Ex: 02"
                    required
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <input
                    type="text"
                    value="01"
                    disabled
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed opacity-70"
                  />
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {needsBranchInput ? 'Esta empresa possui flexibilidade de filial.' : 'A filial padrão para esta empresa é 01.'}
                </p>
              </div>

              {addMessage && (
                <div className={`p-3 rounded-lg text-sm ${addMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {addMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loadingAdd || !newUsername.trim() || !newEmpresaId || (!needsBranchInput && !newFilialId)}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors cursor-pointer"
              >
                {loadingAdd ? 'Processando...' : 'Liberar Acesso'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
}
