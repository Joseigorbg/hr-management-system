import { api } from '../contexts/AuthContext';
import { toast } from 'sonner';

class EvaluationService {
  validateEvaluation(evaluation, evaluations) {
    const errors = {};
    if (!evaluation.userId) errors.userId = 'Colaborador é obrigatório';
    if (!evaluation.evaluatorId) errors.evaluatorId = 'Avaliador é obrigatório';
    if (!evaluation.period) errors.period = 'Período é obrigatório';
    if (!evaluation.score || isNaN(parseFloat(evaluation.score)) || parseFloat(evaluation.score) < 0 || parseFloat(evaluation.score) > 10)
      errors.score = 'Pontuação deve ser um número entre 0 e 10';
    const existing = evaluations.find(
      (evalItem) => evalItem.user_id === evaluation.userId && evalItem.period === evaluation.period && evalItem.id !== (evaluation.id || null)
    );
    if (existing) errors.period = `Já existe uma avaliação para este usuário no período ${evaluation.period}`;
    return errors;
  }

  async fetchUsers() {
    try {
      const response = await api.get('/users', { params: { page: 1, limit: 100 } });
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      toast.error(error.response?.data?.message || 'Erro ao carregar colaboradores', { duration: 3000 });
      return [];
    }
  }

  async fetchEvaluations(user, isAdmin) {
    try {
      let response;
      if (isAdmin) {
        response = await api.get('/performance-evaluations', { params: { page: 1, limit: 10 } });
      } else {
        const [userEvaluations, evaluatorEvaluations] = await Promise.all([
          api.get(`/performance-evaluations/user/${user.id}`, { params: { page: 1, limit: 10 } }),
          api.get(`/performance-evaluations/evaluator/${user.id}`, { params: { page: 1, limit: 10 } }),
        ]);
        const combined = [
          ...(Array.isArray(userEvaluations.data.data) ? userEvaluations.data.data : []),
          ...(Array.isArray(evaluatorEvaluations.data.data) ? evaluatorEvaluations.data.data : []),
        ];
        response = { data: { data: Array.from(new Map(combined.map(item => [item.id, item])).values()) } };
      }
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
      toast.error(error.response?.data?.message || 'Erro ao carregar avaliações', { duration: 3000 });
      return [];
    }
  }

  async createEvaluation(evaluation, evaluations) {
    const errors = this.validateEvaluation(evaluation, evaluations);
    if (Object.keys(errors).length) {
      toast.error('Corrija os erros no formulário antes de criar a avaliação.', { duration: 3000 });
      return { success: false, errors };
    }
    try {
      const payload = {
        userId: evaluation.userId,
        evaluatorId: evaluation.evaluatorId,
        period: evaluation.period,
        score: parseFloat(evaluation.score),
        goals: evaluation.goals || undefined,
        achievements: evaluation.achievements || undefined,
        feedback: evaluation.feedback || undefined,
        status: evaluation.status || 'pending',
      };
      await api.post('/performance-evaluations', payload);
      toast.success('Avaliação criada com sucesso!', { duration: 3000 });
      return { success: true };
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar avaliação.', { duration: 3000 });
      return { success: false, errors: { general: error.response?.data?.message || 'Erro ao criar avaliação' } };
    }
  }

  async updateEvaluation(evaluation, evaluations) {
    const errors = this.validateEvaluation({ ...evaluation, userId: evaluation.user_id, evaluatorId: evaluation.evaluator_id }, evaluations);
    if (Object.keys(errors).length) {
      toast.error('Corrija os erros no formulário antes de atualizar a avaliação.', { duration: 3000 });
      return { success: false, errors };
    }
    try {
      const payload = {
        userId: evaluation.user_id,
        evaluatorId: evaluation.evaluator_id,
        period: evaluation.period,
        score: parseFloat(evaluation.score) || 0,
        goals: evaluation.goals || undefined,
        achievements: evaluation.achievements || undefined,
        feedback: evaluation.feedback || undefined,
        status: evaluation.status,
      };
      await api.patch(`/performance-evaluations/${evaluation.id}`, payload);
      toast.success('Avaliação atualizada com sucesso!', { duration: 3000 });
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      const errorMessage = error.response?.data?.errors
        ? error.response.data.errors.map(e => `${e.property}: ${Object.values(e.constraints).join(', ')}`).join('; ')
        : error.response?.data?.message || 'Erro ao atualizar avaliação.';
      toast.error(errorMessage, { duration: 3000 });
      return { success: false, errors: { general: errorMessage } };
    }
  }

  async deleteEvaluation(id) {
    try {
      await api.delete(`/performance-evaluations/${id}`);
      toast.success('Avaliação excluída com sucesso!', { duration: 3000 });
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error);
      const errorMessage = error.response?.status === 404
        ? 'Avaliação não encontrada.'
        : error.response?.status === 403
        ? 'Você não tem permissão para excluir esta avaliação.'
        : error.response?.data?.message || 'Erro ao excluir avaliação.';
      toast.error(errorMessage, { duration: 3000 });
      return { success: false };
    }
  }
}

export const evaluationService = new EvaluationService();