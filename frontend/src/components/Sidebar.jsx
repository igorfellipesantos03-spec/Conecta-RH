import { useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, BookOpen, FileCheck, LogOut, UserPlus, X } from 'lucide-react';
import api from '../services/api';

export default function Sidebar() {
  const navigate = useNavigate();

  // Modal de Adicionar Usuário
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newDepartamento, setNewDepartamento] = useState('Recursos Humanos');
  const [addMessage, setAddMessage] = useState(null);
  const [loadingAdd, setLoadingAdd] = useState(false);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddMessage(null);
    if (!newUsername.trim()) return;

    setLoadingAdd(true);
    try {
      const resp = await api.post('/users', { username: newUsername, departamento: newDepartamento });
      if (resp.data.success) {
        setAddMessage({ type: 'success', text: resp.data.message || 'Usuário adicionado!' });
        setNewUsername('');
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

  const navItems = [
    { name: 'Hub Principal', path: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'Treinamentos', path: '/treinamentos', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Gerador DISC', path: '/rh/disc-manager', icon: <FileCheck className="w-5 h-5" /> }
  ];

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
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${isActive
                ? 'bg-blue-600/10 text-blue-500 hover:bg-blue-600/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}

        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 w-full text-left cursor-pointer"
        >
          <UserPlus className="w-5 h-5" />
          Adicionar Usuário
        </button>
      </nav>

      {/* Rodapé / Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium w-full text-left text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          Sair do Sistema
        </button>
      </div>

      {/* Modal: Adicionar Usuário */}
      {isAddUserModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => setIsAddUserModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-2">Novo Usuário</h3>
            <p className="text-sm text-gray-400 mb-6">Insira o login do colaborador para liberar o acesso ao ConectaRH.</p>

            <form onSubmit={handleAddUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Login de Rede</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Ex: joao.silva"
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 mb-4"
                  required
                />

                <label className="block text-sm font-medium text-gray-400 mb-1">Departamento</label>
                <select
                  value={newDepartamento}
                  onChange={(e) => setNewDepartamento(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Recursos Humanos">Recursos Humanos</option>
                  <option value="TI">TI</option>
                </select>
              </div>

              {addMessage && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${addMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {addMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loadingAdd || !newUsername.trim()}
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
