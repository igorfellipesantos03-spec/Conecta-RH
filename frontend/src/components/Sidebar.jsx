import { NavLink, useNavigate } from 'react-router-dom';
import { Home, BookOpen, FileCheck, LogOut } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();

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
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/10 text-blue-500 hover:bg-blue-600/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Rodapé / Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium w-full text-left text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
}
