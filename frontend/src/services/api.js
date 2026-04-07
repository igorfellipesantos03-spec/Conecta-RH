import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// O token agora vai via cookie automaticamente (HttpOnly)
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Interceptor para Tratar Erros Globalmente (Token Expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Limpar os dados da sessão local (o cookie HttpOnly será recusado via backend)
      localStorage.removeItem('@ConectaRH:user');
      
      // Redireciona para o login repassando o motivo na URL, se já não estiver na página
      if (!window.location.pathname.includes('/rh/login')) {
        window.location.href = '/rh/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
