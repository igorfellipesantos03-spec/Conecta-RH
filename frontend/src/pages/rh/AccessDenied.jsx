import { useNavigate } from 'react-router-dom';

/**
 * Tela exibida quando um usuário tenta acessar uma rota
 * para a qual o seu perfil (role) não tem permissão.
 */
export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <main className="flex-1 flex items-center justify-center min-h-screen bg-gray-950">
      <div className="text-center max-w-md px-6">
        {/* Ícone */}
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 15v2m0-8v4m0 8a9 9 0 110-18 9 9 0 010 18z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Acesso Negado</h1>
        <p className="text-gray-400 mb-2">
          Você não tem permissão para acessar esta página.
        </p>
        <p className="text-gray-600 text-sm mb-8">
          Se acredita que isso é um erro, entre em contato com o administrador do sistema.
        </p>

        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors cursor-pointer"
        >
          Voltar ao Hub Principal
        </button>
      </div>
    </main>
  );
}
