import { api } from '../contexts/AuthContext';
import { toast } from 'sonner';
import moment from 'moment';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042'];

class DashboardService {
  async fetchDashboardData(user, isEmployee) {
    try {
      const [
        usersResponse,
        departmentsResponse,
        positionsResponse,
        evaluationsResponse,
        supportersResponse,
        tasksResponse,
        admissionsResponse,
        trainingsResponse,
        evalResponse,
      ] = await Promise.all([
        api.get('/users', { params: { limit: 1 } }),
        api.get('/departments', { params: { limit: 10 } }),
        api.get('/positions', { params: { status: 'active', limit: 1 } }),
        api.get('/performance-evaluations', { params: { status: 'pending', limit: 1 } }),
        api.get('/api/v1/supporter', { params: isEmployee ? { status: 'active', limit: 1000 } : { limit: 1000 } }),
        api.get('/api/tasks', { params: isEmployee ? { userId: user.id, limit: 1000 } : { limit: 1000 } }),
        api.get('/admissions', { params: { limit: 1000 } }),
        api.get('/trainings', { params: { limit: 5 } }).catch(e => ({ data: { data: [] } })),
        api.get('/performance-evaluations', { params: { limit: 5 } }).catch(e => ({ data: { data: [] } })),
      ]);

      const totalEmployees = usersResponse.data.meta?.total || 0;
      const totalDepartments = departmentsResponse.data.meta?.total || 0;
      const totalActivePositions = positionsResponse.data.meta?.total || 0;
      const pendingEvaluations = evaluationsResponse.data.meta?.total || 0;
      const supportersData = supportersResponse.data.data || [];
      const totalSupporters = supportersResponse.data.meta?.total || supportersData.length;
      const tasks = (Array.isArray(tasksResponse.data) ? tasksResponse.data : tasksResponse.data || []).filter(task => task.isActive !== false);
      const admissionsData = admissionsResponse.data.data || [];
      const trainingsData = trainingsResponse.data.data || [];
      const evalData = evalResponse.data.data || [];

      const deptDistData = Array.isArray(departmentsResponse.data.data) ? departmentsResponse.data.data : [];
      const departmentData = deptDistData.length > 0 ? deptDistData.map((dept, index) => ({
        name: dept.name || `Departamento ${index + 1}`,
        employees: dept.employee_count || Math.max(1, dept.employee_count || 0),
        fill: COLORS[index % COLORS.length],
      })) : [
        { name: 'Tecnologia da Informação', employees: 50, fill: '#8884d8' },
        { name: 'Financeiro', employees: 30, fill: '#82ca9d' },
        { name: 'Marketing', employees: 20, fill: '#ffc658' },
        { name: 'Logística', employees: 15, fill: '#ff7300' },
        { name: 'Jurídico', employees: 10, fill: '#00C49F' },
        { name: 'Recursos Humanos', employees: 5, fill: '#FFBB28' },
      ];

      const supporterTypeData = [
        { name: 'Suporte de Pessoas', value: supportersData.filter(s => s.supportType === 'people').length, fill: COLORS[0] },
        { name: 'Financiamento', value: supportersData.filter(s => s.supportType === 'funding').length, fill: COLORS[1] },
        { name: 'Documentos', value: supportersData.filter(s => s.supportType === 'documents').length, fill: COLORS[2] },
      ].filter(type => type.value > 0);

      const tasksByMonth = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        const month = moment(date).format('MMM').charAt(0).toUpperCase() + moment(date).format('MMM').slice(1);
        const taskCount = tasks.filter(task => {
          const taskDate = new Date(task.startDate || task.start_date);
          return taskDate.getMonth() === date.getMonth() && taskDate.getFullYear() === date.getFullYear();
        }).length;
        return { month, tasks: taskCount };
      });

      const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        const month = moment(date).format('MMM').charAt(0).toUpperCase() + moment(date).format('MMM').slice(1);
        const monthAdmissions = admissionsData.filter(a => {
          const admissionDate = new Date(a.hireDate);
          return admissionDate.getMonth() === date.getMonth() && admissionDate.getFullYear() === date.getFullYear();
        }).length;
        const departures = admissionsData.filter(a => {
          const updatedDate = new Date(a.updated_at || a.hireDate);
          return a.status === 'terminated' && updatedDate.getMonth() === date.getMonth() && updatedDate.getFullYear() === date.getFullYear();
        }).length;
        return { month, admissions: monthAdmissions, departures };
      });

      const cumulativeAdmissions = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        const month = moment(date).format('MMM').charAt(0).toUpperCase() + moment(date).format('MMM').slice(1);
        const admissionsUpToMonth = admissionsData.filter(a => {
          const admissionDate = new Date(a.hireDate);
          return admissionDate <= new Date(date.getFullYear(), date.getMonth() + 1, 0);
        }).length;
        return { month, cumulativeAdmissions: admissionsUpToMonth };
      });

      const activities = [
        ...admissionsData.slice(0, 5).map(a => ({
          id: a.id,
          type: a.status === 'terminated' ? 'termination' : 'admission',
          message: `${a.user?.name || 'Desconhecido'} foi ${a.status === 'terminated' ? 'desligado' : 'admitido'}${a.status === 'terminated' && a.terminationReason ? `: ${a.terminationReason}` : ''}`,
          time: new Date(a.updated_at || a.hireDate).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        })),
        ...supportersData.slice(0, 5).map(s => ({
          id: s.id,
          type: 'supporter',
          message: `Apoiador "${s.name}" (${s.supportType === 'people' ? 'Suporte de Pessoas' : s.supportType === 'funding' ? 'Financiamento' : 'Documentos'}) ${s.status === 'terminated' ? 'terminado' : s.status === 'inactive' ? 'inativado' : 'criado/atualizado'}`,
          time: new Date(s.updatedAt || s.createdAt || new Date()).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        })),
        ...tasks.slice(0, 5).map(t => ({
          id: t.id,
          type: 'task',
          message: `Tarefa "${t.title}" ${t.userId ? `atribuída a ${t.user?.name || 'usuário desconhecido'}` : 'criada'}`,
          time: new Date(t.createdAt || t.startDate || new Date()).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        })),
        ...trainingsData.map(t => ({
          id: t.id,
          type: 'training',
          message: `Treinamento "${t.name}" agendado`,
          time: new Date(t.created_at || new Date()).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        })),
        ...evalData.map(e => ({
          id: e.id,
          type: 'evaluation',
          message: `Avaliação de ${e.user?.name || 'Desconhecido'} ${e.status === 'pending' ? 'pendente' : 'concluída'}`,
          time: new Date(e.updated_at || new Date()).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        })),
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

      const stats = [
        { title: 'Total de Colaboradores', value: totalEmployees, change: totalEmployees > 0 ? '+5%' : '0%', changeType: 'positive', icon: 'Users' },
        { title: 'Departamentos', value: totalDepartments, change: totalDepartments > 0 ? '+1' : '0', changeType: 'positive', icon: 'Building2' },
        { title: 'Cargos Ativos', value: totalActivePositions, change: totalActivePositions > 0 ? '+2' : '0', changeType: 'positive', icon: 'Briefcase' },
        { title: 'Apoiadores', value: totalSupporters || 0, change: totalSupporters > 0 ? `+${Math.min(totalSupporters, 3)}` : '0', changeType: 'positive', icon: 'Heart' },
        { title: 'Avaliações Pendentes', value: pendingEvaluations, change: pendingEvaluations > 0 ? '-2' : '0', changeType: pendingEvaluations > 0 ? 'negative' : 'neutral', icon: 'TrendingUp' },
      ].slice(0, isEmployee ? 4 : 5);

      return { stats, departmentData, supporterTypeData, tasksData: tasksByMonth, monthlyData, cumulativeAdmissions, recentActivities: activities };
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', { message: error.message, response: error.response?.data });
      toast.error(error.response?.data?.message || 'Erro ao carregar dados do dashboard.', { duration: 3000 });
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();