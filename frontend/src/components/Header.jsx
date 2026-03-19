export default function Header() {
  return (
    <header className="bg-[#0056D2] w-full sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Espaço vazio à esquerda para centralizar perfeitamente o título (se tiver a mesma largura do bloco da direita) */}
        <div className="w-24"></div>

        {/* Título Centralizado */}
        <h1 className="text-white text-xl font-bold tracking-wide">
          ConectaRH
        </h1>

        {/* Ícones à Direita */}
        <div className="w-24 flex justify-end items-center gap-4">
          {/* Perfil (Círculo Simples) */}
          <button className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#0056D2] font-semibold text-sm hover:bg-white transition-colors cursor-pointer">
            IF
          </button>
          
          {/* Logout Icon */}
          <button className="text-white hover:text-blue-100 transition-colors cursor-pointer">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
