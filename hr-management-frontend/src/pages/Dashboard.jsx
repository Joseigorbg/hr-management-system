import { useState, useEffect, useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, Building2, Briefcase, TrendingUp, UserPlus, Calendar, Award, Clock, RefreshCw, UserMinus, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { AuthContext } from '../contexts/AuthContext';
import { dashboardService } from '../services/dashboardService';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042'];

// Mapeamento de ícones para componentes
const getIconComponent = (iconName) => {
  const ICONS = {
    Users: Users,
    Building2: Building2,
    Briefcase: Briefcase,
    TrendingUp: TrendingUp,
    Heart: Heart,
  };
  return ICONS[iconName] || null;
};

const Dashboard = () => {
  const { user, loading: authLoading, isAuthenticated } = useContext(AuthContext);
  const [stats, setStats] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [cumulativeAdmissions, setCumulativeAdmissions] = useState([]);
  const [supporterTypeData, setSupporterTypeData] = useState([]);
  const [tasksData, setTasksData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isEmployee = user?.role === 'employee';

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardService.fetchDashboardData(user, isEmployee);
      setStats(data.stats);
      setDepartmentData(data.departmentData);
      setSupporterTypeData(data.supporterTypeData);
      setTasksData(data.tasksData);
      setMonthlyData(data.monthlyData);
      setCumulativeAdmissions(data.cumulativeAdmissions);
      setRecentActivities(data.recentActivities);
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao carregar dados do dashboard.');
      if (retryCount < 2) {
        setRetryCount(retryCount + 1);
        fetchDashboardData();
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, isEmployee, retryCount]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) fetchDashboardData();
  }, [fetchDashboardData, isAuthenticated, authLoading]);

  const handleRefresh = () => {
    setRetryCount(0);
    fetchDashboardData();
    toast.info('Atualizando dados...', { duration: 2000 });
  };

  const ChartCard = ({ title, data, dataKey, renderChart, className }) => (
    <Card className={`bg-card border-border ${className || ''}`}>
      <CardHeader><CardTitle className="text-foreground">{title}</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : data.length && (dataKey ? data.some(d => d[dataKey] > 0) : true) ? (
          <ResponsiveContainer width="100%" height={300}>{renderChart()}</ResponsiveContainer>
        ) : (
          <div className="text-center text-muted-foreground">
            <p>Nenhum dado disponível</p>
            <Button onClick={handleRefresh} variant="outline" className="mt-2 border-border text-foreground hover:bg-muted">
              <RefreshCw className="mr-2 h-4 w-4" /> Tentar Novamente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (authLoading) return <div className="flex justify-center items-center h-screen"><Skeleton className="h-8 w-8 rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <div className="flex justify-center items-center h-screen"><p className="text-muted-foreground">Faça login para acessar o dashboard.</p></div>;
  if (error) return (
    <div className="space-y-6 p-6">
      <Card className="bg-card border-border">
        <CardHeader><CardTitle>Erro</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={handleRefresh} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
            <RefreshCw className="mr-2 h-4 w-4" /> Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema de gestão de pessoas e apoiadores</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="border-border text-foreground hover:bg-muted">
          <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle>Ações Rápidas</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { to: '/admissions', label: 'Nova Admissão', icon: UserPlus },
              ...(isAdmin || isManager ? [{ to: '/admissions?status=terminated', label: 'Registrar Desligamento', icon: UserMinus, variant: 'destructive' }] : []),
              { to: '/apoiadores', label: 'Novo Apoiador', icon: Heart },
              { to: '/calendario', label: 'Nova Tarefa', icon: Calendar },
              ...(isAdmin || isManager ? [{ to: '/performance-evaluations', label: 'Nova Avaliação', icon: Award }] : []),
            ].map(({ to, label, icon: Icon, variant }, i) => (
              <Link key={i} to={to}>
                <Button className={`w-full ${variant ? `bg-${variant} text-${variant}-foreground hover:bg-${variant}/90` : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                  <Icon className="mr-2 h-4 w-4" /> {label}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? Array.from({ length: isEmployee ? 4 : 5 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        )) : stats.map((stat, i) => {
          const IconComponent = getIconComponent(stat.icon);
          return (
            <Card key={i} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">{stat.title}</CardTitle>
                {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value || 0}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.changeType === 'positive' ? 'text-green-600' : stat.changeType === 'negative' ? 'text-red-600' : 'text-muted-foreground'}>
                    {stat.change}
                  </span> em relação ao mês anterior
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <ChartCard
          title="Distribuição por Departamento"
          data={departmentData}
          renderChart={() => (
            <PieChart>
              <Pie data={departmentData} cx="50%" cy="50%" outerRadius={100} dataKey="employees" nameKey="name">
                {departmentData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        />
        <ChartCard
          title="Apoiadores por Tipo"
          data={supporterTypeData}
          renderChart={() => (
            <PieChart>
              <Pie data={supporterTypeData} cx="50%" cy="50%" labelLine={false} outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                {supporterTypeData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        />
        <ChartCard
          title="Tarefas por Mês"
          data={tasksData}
          dataKey="tasks"
          renderChart={() => (
            <BarChart data={tasksData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="tasks" fill="#00C49F" name="Tarefas" />
            </BarChart>
          )}
        />
        <ChartCard
          title="Admissões vs Desligamentos"
          data={monthlyData}
          className="lg:col-span-2"
          renderChart={() => (
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="admissions" fill="#8884d8" name="Admissões" />
              <Bar dataKey="departures" fill="#ff7300" name="Desligamentos" />
            </BarChart>
          )}
        />
        <ChartCard
          title="Admissões Acumuladas"
          data={cumulativeAdmissions}
          renderChart={() => (
            <BarChart data={cumulativeAdmissions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cumulativeAdmissions" fill="#82ca9d" name="Admissões Acumuladas" />
            </BarChart>
          )}
        />
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader><CardTitle className="text-foreground">Atividades Recentes</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : recentActivities.length ? (
              <ul className="space-y-4">
                {recentActivities.map(activity => (
                  <li key={activity.id} className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-muted">
                      {activity.type === 'admission' && <UserPlus className="h-5 w-5 text-primary" />}
                      {activity.type === 'termination' && <UserMinus className="h-5 w-5 text-destructive" />}
                      {activity.type === 'supporter' && <Heart className="h-5 w-5 text-purple-500" />}
                      {activity.type === 'task' && <Calendar className="h-5 w-5 text-blue-500" />}
                      {activity.type === 'training' && <Calendar className="h-5 w-5 text-blue-500" />}
                      {activity.type === 'evaluation' && <Award className="h-5 w-5 text-green-500" />}
                    </div>
                    <div>
                      <p className="text-foreground">{activity.message}</p>
                      <p className="text-sm text-muted-foreground"><Clock className="inline h-4 w-4 mr-1" /> {activity.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Nenhuma atividade recente</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;