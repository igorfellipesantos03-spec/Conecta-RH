import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // Se redirecionado pelo ProtectedRoute, exibe a mensagem de erro que veio no state
  const [errorMsg, setErrorMsg] = useState(location.state?.error || '');
  const [isLoading, setIsLoading] = useState(false);

  // Checa parâmetros da URL para identificar logout por inatividade
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setErrorMsg('Sessão expirada. Você foi desconectado por inatividade.');
      // Opcional: Limpar o param da URL para evitar mostrar de novo no reload
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://192.168.0.144:3001/api/auth/login', {
        username,
        password
      });

      if (response.data.success) {
        // Salva apenas os dados básicos no LocalStorage (o acess_token é retornado via Cookie HttpOnly agora)
        localStorage.setItem('@ConectaRH:user', JSON.stringify(response.data.user));

        // Redireciona para o HUB (Home)
        navigate('/');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMsg(error.response.data.error);
      } else {
        setErrorMsg('Servidor indisponível ou erro de conexão.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      {/* Logo Exclusiva Centralizada */}
      <div className="mb-8">
        <img
          src="/logo.png"
          alt="ConectaRH"
          className="h-20 object-contain drop-shadow-[0_0_15px_rgba(0,86,210,0.5)]"
        />
      </div>

      {/* Card Principal */}
      <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-2xl shadow-xl p-8 relative overflow-hidden">
        {/* Glow sutil azul no topo do card */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#0056D2] to-transparent opacity-80" />

        <div className="text-center mb-8 flex flex-col items-center">
          <span className="text-sm font-medium text-gray-400 tracking-wider uppercase">Login</span>
          <div className="w-8 h-[2px] bg-blue-600 rounded-full my-2"></div>
          <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">
            ConectaRH
          </span>
          <p className="text-gray-400 text-sm mt-1">Use suas credenciais do Protheus para acessar o Sistema</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Usuário Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              required
              className="bg-gray-950 border border-gray-700 text-white text-sm rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 placeholder-gray-500 outline-none transition-colors"
              placeholder="Digite seu usuário..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Senha Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="password"
              required
              className="bg-gray-950 border border-gray-700 text-white text-sm rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 placeholder-gray-500 outline-none transition-colors"
              placeholder="Digite sua senha..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Mensagem de Erro */}
          {errorMsg && (
            <div className="bg-red-950/50 border border-red-500/50 text-red-200 text-xs rounded-lg p-3 flex gap-2 items-start mt-4">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center h-12 text-white bg-blue-600 hover:bg-blue-500 disabled:bg-[#0056D2]/50 disabled:cursor-not-allowed focus:ring-4 focus:outline-none focus:ring-blue-800 font-semibold rounded-lg text-sm px-5 py-2.5 text-center transition-all mt-6 shadow-[0_0_20px_rgba(0,86,210,0.3)] hover:shadow-[0_0_25px_rgba(0,86,210,0.5)]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Validando Acesso...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

      </div>

      {/* Rodapé sutil */}
      <div className="mt-8 text-xs text-gray-600">
        &copy; {new Date().getFullYear()} Conasa Infraestrutura S.A.
      </div>
    </div>
  );
}
