import { useState, useEffect } from 'react';

export default function Header() {
  const [userData, setUserData] = useState({ name: 'Administrador', initials: 'AD', role: 'RH' });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('@ConectaRH:user');
      if (stored) {
        const user = JSON.parse(stored);
        const fullName = user.name || 'Administrador';
        
        // Extrai iniciais do primeiro e último nome
        const parts = fullName.split(' ');
        let initials = parts[0].charAt(0).toUpperCase();
        if (parts.length > 1) {
          initials += parts[parts.length - 1].charAt(0).toUpperCase();
        } else if (parts[0].length > 1) {
          initials += parts[0].charAt(1).toUpperCase();
        }
        
        setUserData({
          name: fullName,
          role: user.role || 'Administrador',
          initials
        });
      }
    } catch(err) {}
  }, []);

  return (
    <header className="bg-[#0056D2] w-full sticky top-0 z-40 shadow-sm">
      <div className="w-full px-6 h-20 flex items-center justify-between">
        {/* Título da Página / Breadcrumb */}
        <div>
          <h1 className="text-white text-lg font-bold tracking-wide">
            Administração <span className="text-blue-200">RH</span>
          </h1>
        </div>

        {/* Ícones à Direita */}
        <div className="flex justify-end items-center gap-4">
          {/* Perfil (Círculo Simples) */}
          <div className="flex items-center gap-3">
             <div className="flex flex-col text-right hidden sm:flex">
               <span className="text-sm font-medium text-white whitespace-nowrap">{userData.name}</span>
               <span className="text-xs text-blue-200 whitespace-nowrap">{userData.role}</span>
             </div>
             <button className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#0056D2] font-semibold text-sm hover:bg-white transition-colors cursor-pointer border-2 border-transparent hover:border-blue-300 shrink-0" title="Seu Perfil">
               {userData.initials}
             </button>
          </div>
        </div>
      </div>
    </header>
  );
}
