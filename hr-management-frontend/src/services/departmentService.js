import { api } from '../contexts/AuthContext';
import { toast } from 'sonner';

class DepartmentService {
  validateDepartment(department) {
    const errors = {};
    if (!department.name?.trim()) errors.name = 'Nome é obrigatório';
    if (!department.description?.trim()) errors.description = 'Descrição é obrigatória';
    return errors;
  }

  async fetchUsers() {
    try {
      const response = await api.get('/users', { params: { page: 1, limit: 100 } });
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error.response?.data || error.message);
      return [];
    }
  }

  async fetchDepartments({ searchTerm = '', startDate = '', endDate = '' }) {
    try {
      const params = { page: 1, limit: 10 };
      if (searchTerm) params.search = searchTerm;
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const response = await api.get('/departments', { params });
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error('Erro ao buscar departamentos:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Erro ao carregar os departamentos', { duration: 3000 });
      return [];
    }
  }

  async createDepartment(department) {
    const errors = this.validateDepartment(department);
    if (Object.keys(errors).length) {
      toast.error('Preencha todos os campos obrigatórios corretamente', { duration: 3000 });
      return { success: false, errors };
    }
    try {
      const payload = {
        name: department.name,
        description: department.description,
        managerId: department.managerId === 'none' ? null : department.managerId,
      };
      await api.post('/departments', payload);
      toast.success('Departamento criado com sucesso!', { duration: 3000 });
      return { success: true };
    } catch (error) {
      console.error('Erro ao criar departamento:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Erro ao criar o departamento', { duration: 3000 });
      return { success: false };
    }
  }

  async updateDepartment(department) {
    const errors = this.validateDepartment(department);
    if (Object.keys(errors).length) {
      toast.error('Preencha todos os campos obrigatórios corretamente', { duration: 3000 });
      return { success: false, errors };
    }
    try {
      const payload = {
        name: department.name,
        description: department.description,
        managerId: department.managerId === 'none' ? null : department.managerId,
      };
      await api.patch(`/departments/${department.id}`, payload);
      toast.success('Departamento atualizado com sucesso!', { duration: 3000 });
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar departamento:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Erro ao atualizar o departamento', { duration: 3000 });
      return { success: false };
    }
  }

  async deleteDepartment(id) {
    try {
      await api.delete(`/departments/${id}`);
      toast.success('Departamento excluído com sucesso!', { duration: 3000 });
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir departamento:', error.response?.data || error.message);
      const errorMessage = error.response?.status === 404
        ? 'Departamento não encontrado.'
        : error.response?.status === 403
        ? 'Você não tem permissão para excluir este departamento.'
        : error.response?.data?.message || 'Erro ao excluir o departamento.';
      toast.error(errorMessage, { duration: 3000 });
      return { success: false };
    }
  }

  async generateReport({ startDate, endDate }) {
    if (!startDate || !endDate) {
      toast.error('Selecione as datas inicial e final para gerar o relatório.', { duration: 3000 });
      return { success: false };
    }
    try {
      const response = await api.get(`/departments/date-range`, { params: { startDate, endDate } });
      console.log('Dados do relatório:', response.data);
      toast.success('Relatório gerado com sucesso!', { duration: 3000 });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao gerar relatório:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Erro ao gerar o relatório.', { duration: 3000 });
      return { success: false };
    }
  }
}

export const departmentService = new DepartmentService();