import { api } from '../contexts/AuthContext';
import { getUserIdFromToken } from '@/utils/auth';

const allowedFileTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.ms-excel',
  'text/plain',
  'image/jpeg',
  'image/png',
];

const processError = (error, defaultMessage) => {
  const message = error.response?.data?.message || error.message || defaultMessage;
  return new Error(message);
};

const reportService = {
  async validateFiles(files) {
    if (!files?.length) return { error: 'Nenhum arquivo selecionado' };
    const invalidFiles = files.filter(file => !allowedFileTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      return { error: `Arquivos inválidos: ${invalidFiles.map(f => f.name).join(', ')}` };
    }
    return { validFiles: files };
  },

  async createReport(data) {
    try {
      const response = await api.post('/reports', data);
      return response.data;
    } catch (error) {
      throw processError(error, 'Erro ao criar relatório');
    }
  },

  async updateReport(id, data) {
    try {
      const response = await api.patch(`/reports/${id}`, data);
      return response.data;
    } catch (error) {
      throw processError(error, 'Erro ao atualizar relatório');
    }
  },

  async fetchReports(page = 1, limit = 10, searchTerm = '') {
    try {
      const response = await api.get('/reports', { params: { page, limit, type: searchTerm } });
      return response.data;
    } catch (error) {
      throw processError(error, 'Erro ao buscar relatórios');
    }
  },

  async deleteReport(id) {
    try {
      const response = await api.delete(`/reports/${id}`);
      return response.data;
    } catch (error) {
      throw processError(error, 'Erro ao deletar relatório');
    }
  },

  async downloadDocument(documentId, download = false) {
    try {
      const response = await api.get(`/reports/download/${documentId}`, { responseType: 'arraybuffer' });
      const fileName = response.headers['content-disposition']?.match(/filename="(.+)"/)?.[1] || 'document.pdf';
      const fileType = response.headers['content-type'] || 'application/pdf';
      if (!response.data || response.data.byteLength === 0) throw new Error('Buffer de arquivo vazio');
      const bufferPreview = new Uint8Array(response.data.slice(0, 4));
      if (fileType === 'application/pdf' && bufferPreview[0] !== 0x25) throw new Error('Arquivo não é um PDF válido');
      const blob = new Blob([response.data], { type: fileType });
      const url = URL.createObjectURL(blob);
      if (download) {
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return { fileName, fileType };
      }
      return { fileName, fileType, url };
    } catch (error) {
      throw processError(error, 'Erro ao baixar documento');
    }
  },

  async uploadDocument(formData) {
    try {
      const userId = getUserIdFromToken() || localStorage.getItem('userId');
      if (!userId) throw new Error('User ID não encontrado');
      const files = formData.getAll('files');
      if (!files?.length) throw new Error('Nenhum arquivo válido');
      const response = await api.post('/reports/upload', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw processError(error, 'Erro ao fazer upload do documento');
    }
  },

  async generateReport(type, filters) {
    try {
      const response = await api.post(`/reports/generate/${type}`, filters, { responseType: 'arraybuffer' });
      const fileName = response.headers['content-disposition']?.match(/filename="(.+)"/)?.[1] || 'report.pdf';
      const fileType = response.headers['content-type'] || 'application/pdf';
      if (!response.data || response.data.byteLength === 0) throw new Error('Buffer de arquivo vazio');
      const bufferPreview = new Uint8Array(response.data.slice(0, 4));
      if (fileType === 'application/pdf' && bufferPreview[0] !== 0x25) throw new Error('Arquivo não é um PDF válido');
      return { fileName, fileType, buffer: response.data };
    } catch (error) {
      throw processError(error, 'Erro ao gerar relatório');
    }
  },

  async findOne(id) {
    try {
      const response = await api.get(`/reports/${id}`);
      return response.data;
    } catch (error) {
      throw processError(error, 'Relatório não encontrado');
    }
  },
};

export default reportService;