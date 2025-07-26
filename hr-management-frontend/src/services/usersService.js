import { api } from '../contexts/AuthContext'; // Substitui apiService

const usersService = {
  async getUsers(page = 1, limit = 50, search = '') {
    try {
      console.log('Buscando usuários:', { page, limit, search });
      const response = await api.get('/users', {
        params: { page, limit, search },
      });
      const users = Array.isArray(response.data) ? response.data : response.data?.data || [];
      console.log('Usuários recebidos:', users);
      return users;
    } catch (error) {
      console.error('Erro ao carregar usuários:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Falha ao carregar usuários');
    }
  },

  async getUserById(id) {
    try {
      console.log('Buscando usuário por ID:', { id });
      const response = await api.get(`/users/${id}`);
      console.log('Usuário recebido:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao carregar usuário por ID:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Falha ao carregar usuário');
    }
  },
};

export default usersService;