import { api } from '../contexts/AuthContext';
import { toast } from 'sonner';

class TaskService {
  async fetchTasks(userId, isEmployee, canViewAll) {
    try {
      const params = { page: 1, limit: 100 };
      if (isEmployee) params.userId = userId;
      else if (userId && canViewAll) params.userId = userId;
      const { data } = await api.get('/api/tasks', { params });
      const tasksData = Array.isArray(data) ? data : data || [];
      const formattedTasks = tasksData.map(task => ({
        id: task.id,
        title: task.title || 'Tarefa sem título',
        description: task.description,
        start: new Date(task.startDate || task.start_date),
        end: new Date(task.endDate || task.end_date),
        user: task.user || { id: task.userId, name: 'Não atribuído', email: '' },
        group: task.group || { id: task.groupId, name: 'Não atribuído' },
        isActive: task.isActive !== undefined ? task.isActive : true,
      }));
      toast.success('Tarefas carregadas com sucesso!', { duration: 3000 });
      return formattedTasks;
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Erro ao carregar tarefas', { duration: 3000 });
      return [];
    }
  }

  async fetchUsers() {
    try {
      const params = { page: 1, limit: 100, include: 'admission', status: 'active' };
      const { data } = await api.get('/users', { params });
      const usersData = Array.isArray(data.data) ? data.data : data || [];
      return usersData.filter(user => user.isActive && (!user.admissions || user.admissions?.status === 'active'));
    } catch (err) {
      console.error('Erro ao buscar usuários:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Erro ao carregar usuários', { duration: 3000 });
      return [];
    }
  }

  async fetchGroups() {
    try {
      const { data } = await api.get('/api/groups');
      return Array.isArray(data) ? data : data || [];
    } catch (err) {
      console.error('Erro ao buscar grupos:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Erro ao carregar grupos', { duration: 3000 });
      return [];
    }
  }

  async createTask(taskData) {
    try {
      const taskPayload = {
        title: taskData.title,
        description: taskData.description || '',
        startDate: taskData.startDate,
        endDate: taskData.endDate,
        userId: taskData.userId || null,
        groupId: taskData.groupId || null,
      };
      const { data } = await api.post('/api/tasks', taskPayload);
      if (taskData.userId) {
        await api.post('/api/tasks/assign', { taskId: data.id, userId: taskData.userId });
      }
      toast.success('Tarefa criada com sucesso!', { duration: 3000 });
      return data;
    } catch (err) {
      console.error('Erro ao criar tarefa:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Erro ao criar tarefa', { duration: 3000 });
      throw err;
    }
  }

  async updateTask(taskId, taskData) {
    try {
      await api.patch(`/api/tasks/${taskId}`, {
        title: taskData.title,
        description: taskData.description || '',
        startDate: taskData.startDate,
        endDate: taskData.endDate,
      });
      toast.success('Tarefa editada com sucesso!', { duration: 3000 });
    } catch (err) {
      console.error('Erro ao editar tarefa:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Erro ao editar tarefa', { duration: 3000 });
      throw err;
    }
  }

  async assignTask(taskId, userId) {
    try {
      await api.post('/api/tasks/assign', { taskId, userId });
      toast.success('Tarefa atribuída com sucesso!', { duration: 3000 });
    } catch (err) {
      console.error('Erro ao atribuir tarefa:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Erro ao atribuir tarefa', { duration: 3000 });
      throw err;
    }
  }

  async removeTaskAssignment(taskId, userId) {
    try {
      await api.delete(`/api/tasks/assign/user/${userId}/${taskId}`);
      toast.success('Tarefa removida com sucesso!', { duration: 3000 });
    } catch (err) {
      console.error('Erro ao remover tarefa:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Erro ao remover tarefa', { duration: 3000 });
      throw err;
    }
  }

  async deleteTask(taskId) {
    try {
      await api.delete(`/api/tasks/${taskId}`);
      toast.success('Tarefa excluída com sucesso!', { duration: 3000 });
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Erro ao excluir tarefa', { duration: 3000 });
      throw err;
    }
  }

  async generateReport(userId) {
    try {
      const filters = {
        userId: userId || undefined,
        isActive: true,
        startDate: moment().startOf('month').toISOString(),
        endDate: moment().endOf('month').toISOString(),
      };
      const { data } = await api.get('/api/reports/generate/tasks', { params: filters });
      toast.success('Relatório de tarefas gerado com sucesso!', { duration: 3000 });
      return data;
    } catch (err) {
      console.error('Erro ao gerar relatório:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Erro ao gerar relatório', { duration: 3000 });
      throw err;
    }
  }
}

export const taskService = new TaskService();