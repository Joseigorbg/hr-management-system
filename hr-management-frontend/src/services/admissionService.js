import { api } from '../contexts/AuthContext';
import { toast } from 'sonner';

class AdmissionService {
  async fetchUsers(role = 'employee') {
    try {
      const { data } = await api.get('/users', { params: { role } });
      return Array.isArray(data.data) ? data.data : [];
    } catch (err) {
      console.error('Erro ao buscar usuários:', err.response?.data || err.message);
      toast.error('Erro ao carregar usuários', { duration: 3000 });
      return [];
    }
  }

  async fetchUserDetails(userId) {
    try {
      const { data } = await api.get(`/users/${userId}`);
      return data.profile || {};
    } catch (err) {
      console.error('Erro ao buscar detalhes do usuário:', err.response?.data || err.message);
      toast.error('Erro ao carregar detalhes do colaborador', { duration: 3000 });
      return {};
    }
  }

  async fetchPositions() {
    try {
      const { data } = await api.get('/positions');
      return Array.isArray(data.data) ? data.data : [];
    } catch (err) {
      console.error('Erro ao buscar cargos:', err.response?.data || err.message);
      toast.error('Erro ao carregar cargos', { duration: 3000 });
      return [];
    }
  }

  async fetchDepartments() {
    try {
      const { data } = await api.get('/departments');
      return Array.isArray(data.data) ? data.data : [];
    } catch (err) {
      console.error('Erro ao buscar departamentos:', err.response?.data || err.message);
      toast.error('Erro ao carregar departamentos', { duration: 3000 });
      return [];
    }
  }

  async fetchAdmissions(searchTerm = '') {
    try {
      const params = { page: 1, limit: 10, include: 'user,position,department', ...(searchTerm && { search: searchTerm }) };
      const { data } = await api.get('/admissions', { params });
      return Array.isArray(data.data) ? data.data.filter(adm => adm?.id && adm?.user?.id) : [];
    } catch (err) {
      console.error('Erro ao buscar admissões:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Erro ao carregar admissões', { duration: 3000 });
      return [];
    }
  }

  async createAdmission(admissionData, files) {
    try {
      const formData = new FormData();
      Object.entries(admissionData).forEach(([key, value]) => formData.append(key, value));
      files.forEach(file => formData.append('documents', file));
      const response = await api.post('/admissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Admissão criada com sucesso!', { duration: 3000 });
      return response.data;
    } catch (err) {
      console.error('Erro ao criar admissão:', err.response?.data || err.message);
      const errorMessage = Array.isArray(err.response?.data?.message)
        ? err.response.data.message.join(', ')
        : err.response?.data?.message || 'Erro ao criar admissão';
      toast.error(errorMessage, { duration: 3000 });
      throw err;
    }
  }

  async updateAdmission(admissionId, admissionData, files) {
    try {
      const formData = new FormData();
      Object.entries(admissionData).forEach(([key, value]) => formData.append(key, value));
      files.forEach(file => formData.append('documents', file));
      const response = await api.patch(`/admissions/${admissionId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Admissão atualizada com sucesso!', { duration: 3000 });
      return response.data;
    } catch (err) {
      console.error('Erro ao atualizar admissão:', err.response?.data || err.message);
      const errorMessage = Array.isArray(err.response?.data?.message)
        ? err.response.data.message.join(', ')
        : err.response?.data?.message || 'Erro ao atualizar admissão';
      toast.error(errorMessage, { duration: 3000 });
      throw err;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await api.patch('/profile/me', profileData);
      toast.success('Perfil atualizado com sucesso!', { duration: 3000 });
      return response.data;
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Erro ao atualizar perfil', { duration: 3000 });
      throw err;
    }
  }

  async deleteAdmission(admissionId) {
    try {
      await api.delete(`/admissions/${admissionId}`);
      toast.success('Admissão desativada com sucesso!', { duration: 3000 });
    } catch (err) {
      console.error('Erro ao desativar admissão:', err.response?.data || err.message);
      const errorMessage = err.response?.status === 404
        ? 'Admissão não encontrada.'
        : err.response?.status === 403
        ? 'Você não tem permissão para desativar esta admissão.'
        : err.response?.data?.message || 'Erro ao desativar admissão';
      toast.error(errorMessage, { duration: 3000 });
      throw err;
    }
  }

  async deleteDocument(admissionId, documentId) {
    try {
      await api.delete(`/admissions/${admissionId}/documents/${documentId}`);
      toast.success('Documento excluído com sucesso!', { duration: 3000 });
    } catch (err) {
      console.error('Erro ao excluir documento:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Erro ao excluir o documento', { duration: 3000 });
      throw err;
    }
  }
}

export const admissionService = new AdmissionService();