import { api } from '../contexts/AuthContext';

const profileService = {
  getProfile: async () => {
    try {
      const response = await api.get('/profile/me');
      console.log('Resposta getProfile:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erro ao carregar perfil');
    }
  },

  getRecentActivity: async () => {
    try {
      const response = await api.get('/profile/me/activity');
      console.log('Resposta getRecentActivity:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar atividades:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erro ao carregar atividades');
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await api.patch('/profile/me', data);
      console.log('Resposta updateProfile:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erro ao atualizar perfil');
    }
  },

updateAvatar: async (formData) => {
  try {
    for (let [key, value] of formData.entries()) {
      console.log('FormData sent:', key, value, value instanceof File);
    }
    const response = await api.patch('/profile/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Resposta updateAvatar:', JSON.stringify(response.data, null, 2));
    return response.data; // response é usado aqui, mas o lint pode não reconhecer
  } catch (error) {
    console.error('Erro ao atualizar avatar:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erro ao atualizar avatar');
  }
},

  updatePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.patch('/profile/me/password', { currentPassword, newPassword });
      console.log('Resposta updatePassword:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar senha:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erro ao atualizar senha');
    }
  },
};

export default profileService;