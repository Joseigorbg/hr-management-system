import { api } from '../contexts/AuthContext'; // Substitui apiService
import { setAuthData, clearAuthData, getAuthToken, getUserIdFromToken } from '@/utils/auth';

class AuthService {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data?.access_token && response.data?.user) {
        setAuthData(response.data.access_token, response.data.user.id);
      } else {
        console.warn('Resposta de login não contém token ou userId:', response.data);
        throw new Error('Resposta de login inválida');
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer login:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Falha ao fazer login');
    }
  }

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Erro ao registrar:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Falha ao registrar');
    }
  }

  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Erro ao carregar perfil:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Falha ao carregar perfil');
    }
  }

  async refreshToken() {
    try {
      const response = await api.post('/auth/refresh');
      if (response.data?.access_token) {
        const userId = getUserIdFromToken() || localStorage.getItem('userId');
        setAuthData(response.data.access_token, userId);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar token:', error.response?.data || error.message);
      clearAuthData();
      throw new Error(error.response?.data?.message || 'Falha ao atualizar token');
    }
  }

  logout() {
    clearAuthData();
  }
}

export const authService = new AuthService();