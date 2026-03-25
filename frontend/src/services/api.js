import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@ConectaRH:access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para Tratar Erros Globalmente (Token Expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Limpar os dados da sessão local
      localStorage.removeItem('@ConectaRH:access_token');
      localStorage.removeItem('@ConectaRH:refresh_token');
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
