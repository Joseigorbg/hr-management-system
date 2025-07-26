import { api } from '../contexts/AuthContext';

const TrainingService = {
  async getTrainings(searchTerm = '') {
    try {
      console.log('Buscando treinamentos:', { searchTerm });
      const response = await api.get('/trainings', { params: { search: searchTerm } });
      console.log('Treinamentos recebidos:', response.data);
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error('Erro ao listar treinamentos:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.message || 'Falha ao carregar treinamentos');
    }
  },

  async getTraining(id) {
    try {
      console.log('Buscando treinamento por ID:', { id });
      const response = await api.get(`/trainings/${id}`);
      console.log('Treinamento recebido:', response.data);
      return response.data.data || {};
    } catch (error) {
      console.error('Erro ao obter treinamento:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.message || 'Falha ao carregar treinamento');
    }
  },

  async createTraining(data, files = []) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'instructorId' && data[key] === 'none') return; // Skip instructorId if 'none'
      formData.append(key, data[key]);
    });
    files.forEach(file => formData.append('document', file)); // Match backend field name

    try {
      console.log('Criando treinamento com dados:', Object.fromEntries(formData));
      const response = await api.post('/trainings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Treinamento criado:', response.data);
      return response.data.data || {};
    } catch (error) {
      console.error('Erro ao criar treinamento:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.message || 'Erro ao criar treinamento');
    }
  },

  async updateTraining(id, data, files = []) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'instructorId' && data[key] === 'none') return; // Skip instructorId if 'none'
      if (data[key]) formData.append(key, data[key]);
    });
    files.forEach(file => formData.append('document', file)); // Match backend field name

    try {
      console.log('Atualizando treinamento:', { id, formData: Object.fromEntries(formData) });
      const response = await api.patch(`/trainings/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Treinamento atualizado:', response.data);
      return response.data.data || {};
    } catch (error) {
      console.error('Erro ao atualizar treinamento:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.message || 'Erro ao atualizar treinamento');
    }
  },

  async deleteTraining(id) {
    try {
      console.log('Excluindo treinamento:', { id });
      const response = await api.delete(`/trainings/${id}`);
      console.log('Treinamento excluído:', response.data);
      return response.data || {};
    } catch (error) {
      console.error('Erro ao excluir treinamento:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.message || 'Erro ao excluir treinamento');
    }
  },

  async getStats() {
    try {
      console.log('Buscando estatísticas de treinamentos');
      const response = await api.get('/stats');
      console.log('Estatísticas recebidas:', response.data);
      return response.data.data || { trainings: { total: 0 }, enrollments: { total: 0, completed: 0, completionRate: 0 } };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.message || 'Falha ao carregar estatísticas');
    }
  },

  async getDepartments() {
    try {
      console.log('Buscando departamentos');
      const response = await api.get('/departments');
      console.log('Departamentos recebidos:', response.data);
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error('Erro ao listar departamentos:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.message || 'Falha ao carregar departamentos');
    }
  },

  async getPositions() {
    try {
      console.log('Buscando cargos');
      const response = await api.get('/positions');
      console.log('Cargos recebidos:', response.data);
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error('Erro ao listar cargos:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.message || 'Falha ao carregar cargos');
    }
  },

  async getUsers() {
    try {
      console.log('Buscando usuários');
      const response = await api.get('/users');
      console.log('Usuários recebidos:', response.data);
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error('Erro ao listar usuários:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.message || 'Falha ao carregar usuários');
    }
  },

  async getGroups() {
    try {
      console.log('Buscando grupos');
      const response = await api.get('/groups');
      console.log('Grupos recebidos:', response.data);
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error('Erro ao listar grupos:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.message || 'Falha ao carregar grupos');
    }
  },

  async enrollUser(trainingId, userId) {
    try {
      console.log('Inscrevendo usuário:', { trainingId, userId });
      const response = await api.post(`/trainings/${trainingId}/enroll`, { userId });
      console.log('Inscrição realizada:', response.data);
      return response.data.data || {};
    } catch (error) {
      console.error('Erro ao inscrever usuário:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.message || 'Falha ao inscrever usuário');
    }
  },

  async enrollByGroup(trainingId, data) {
    try {
      console.log('Inscrevendo grupo:', { trainingId, data });
      const response = await api.post(`/trainings/${trainingId}/enroll-group`, data);
      console.log('Inscrição de grupo realizada:', response.data);
      return response.data.data || {};
    } catch (error) {
      console.error('Erro ao inscrever grupo:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.message || 'Falha ao inscrever grupo');
    }
  },

  async uploadDocuments(trainingId, files) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      console.log('Enviando documentos:', { trainingId, files });
      const response = await api.post(`/trainings/${trainingId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Documentos enviados:', response.data);
      return response.data.data || {};
    } catch (error) {
      console.error('Erro ao enviar documentos:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.message || 'Falha ao enviar documentos');
    }
  },

  async deleteDocument(trainingId, documentId) {
    try {
      console.log('Excluindo documento:', { trainingId, documentId });
      const response = await api.delete(`/trainings/${trainingId}/documents/${documentId}`);
      console.log('Documento excluído:', response.data);
      return response.data || {};
    } catch (error) {
      console.error('Erro ao excluir documento:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.message || 'Falha ao excluir documento');
    }
  },

  async getDocument(trainingId, documentId) {
    try {
      console.log('Baixando documento:', { trainingId, documentId });
      const response = await api.get(`/trainings/${trainingId}/documents/${documentId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'document');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter documento:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.message || 'Falha ao baixar documento');
    }
  },

  async updateProgress(trainingId, progress) {
    try {
      console.log('Atualizando progresso:', { trainingId, progress });
      const response = await api.patch(`/trainings/${trainingId}/progress`, { progress });
      console.log('Progresso atualizado:', response.data);
      return response.data.data || {};
    } catch (error) {
      console.error('Erro ao atualizar progresso:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.message || 'Falha ao atualizar progresso');
    }
  },

  async getParticipants(trainingId) {
    try {
      console.log('Buscando participantes:', { trainingId });
      const response = await api.get(`/trainings/${trainingId}/participants`);
      console.log('Participantes recebidos:', response.data);
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error('Erro ao listar participantes:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.message || 'Falha ao carregar participantes');
    }
  },
};

export default TrainingService;