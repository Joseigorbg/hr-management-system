import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
});

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        } else {
          config.headers['Content-Type'] = 'application/json';
        }
        console.log('Configuração da requisição:', {
          url: config.url,
          method: config.method,
          headers: config.headers,
          data: config.data instanceof FormData ? 'FormData' : config.data,
        });
        return config;
      },
      (error) => Promise.reject(error),
    );

    return () => api.interceptors.request.eject(interceptor);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api
        .get('/auth/profile')
        .then((response) => {
          console.log('Auth profile response:', JSON.stringify(response.data, null, 2));
          setUser(response.data);
        })
        .catch((error) => {
          console.error('Erro ao obter perfil:', error.response?.data || error.message);
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      console.log('Login response user:', JSON.stringify(userData, null, 2));
      setUser(userData);
      return response.data;
    } catch (error) {
      console.error('Erro no login:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      console.log('Forgot password response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erro ao solicitar redefinição de senha');
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/profile');
      console.log('Refresh user response:', JSON.stringify(response.data, null, 2));
      setUser(response.data);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error.response?.data || error.message);
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    logout,
    forgotPassword, // Adicionado aqui
    loading,
    isAuthenticated: !!user,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};