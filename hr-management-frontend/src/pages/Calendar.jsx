import { useState, useEffect, useContext } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { AuthContext } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { taskService } from '../services/taskService';

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const { user, loading, isAuthenticated } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [userId, setUserId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [assignSearchTerm, setAssignSearchTerm] = useState('');
  const [createSelectSearchTerm, setCreateSelectSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [assignUserId, setAssignUserId] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '', startDate: '', endDate: '', userId: '', groupId: '' });
  const [editTask, setEditTask] = useState(null);
  const [hoverTask, setHoverTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isEmployee = user?.role === 'employee';
  const canCreate = isAdmin || isManager;
  const canEdit = isAdmin || isManager;
  const canDelete = isAdmin;
  const canAssign = isAdmin || isManager;
  const canGenerateReport = isAdmin || isManager;
  const canViewAll = isAdmin || isManager;

  useEffect(() => {
    if (!isAuthenticated || loading) return;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [tasksData, usersData, groupsData] = await Promise.all([
          taskService.fetchTasks(user.id, isEmployee, canViewAll),
          taskService.fetchUsers(),
          taskService.fetchGroups(),
        ]);
        setTasks(tasksData);
        setUsers(usersData);
        setGroups(groupsData);
        if (tasksData.length === 0) {
          toast.info(isEmployee ? 'Nenhuma tarefa atribuída a você.' : canCreate ? 'Nenhuma tarefa encontrada. Adicione uma nova tarefa.' : 'Nenhuma tarefa encontrada. Verifique com o administrador.', { duration: 3000 });
        }
      } catch {
        // Erros já tratados no serviço
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, loading, user, userId, isEmployee, canViewAll]);

  const validateTask = task => {
    if (!task.title) return 'O título é obrigatório';
    if (!task.startDate) return 'A data de início é obrigatória';
    if (!task.endDate) return 'A data de término é obrigatória';
    if (moment(task.endDate).isBefore(task.startDate)) return 'A data de término deve ser posterior à data de início';
    return null;
  };

  const handleCreate = async () => {
    const error = validateTask(newTask);
    if (error) return toast.error(error, { duration: 3000 });
    setIsLoading(true);
    try {
      await taskService.createTask(newTask);
      setNewTask({ title: '', description: '', startDate: '', endDate: '', userId: '', groupId: '' });
      setCreateSelectSearchTerm('');
      setIsCreateDialogOpen(false);
      setTasks(await taskService.fetchTasks(user.id, isEmployee, canViewAll));
    } catch {
      // Erro já tratado no serviço
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editTask || !editTask.id) return;
    const error = validateTask(editTask);
    if (error) return toast.error(error, { duration: 3000 });
    setIsLoading(true);
    try {
      await taskService.updateTask(editTask.id, editTask);
      setIsEditDialogOpen(false);
      setEditTask(null);
      setTasks(await taskService.fetchTasks(user.id, isEmployee, canViewAll));
    } catch {
      // Erro já tratado no serviço
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!assignUserId || !selectedTaskId) return toast.error('Selecione um usuário e uma tarefa.', { duration: 3000 });
    setIsLoading(true);
    try {
      await taskService.assignTask(selectedTaskId, assignUserId);
      setIsAssignDialogOpen(false);
      setAssignUserId('');
      setAssignSearchTerm('');
      setSelectedTaskId(null);
      setTasks(await taskService.fetchTasks(user.id, isEmployee, canViewAll));
    } catch {
      // Erro já tratado no serviço
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!assignUserId || !selectedTaskId) return toast.error('Selecione um usuário e uma tarefa.', { duration: 3000 });
    if (!window.confirm('Tem certeza que deseja remover esta tarefa?')) return;
    setIsLoading(true);
    try {
      await taskService.removeTaskAssignment(selectedTaskId, assignUserId);
      setIsAssignDialogOpen(false);
      setAssignUserId('');
      setAssignSearchTerm('');
      setSelectedTaskId(null);
      setTasks(await taskService.fetchTasks(user.id, isEmployee, canViewAll));
    } catch {
      // Erro já tratado no serviço
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsLoading(true);
    try {
      await taskService.deleteTask(taskToDelete);
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
      setTasks(await taskService.fetchTasks(user.id, isEmployee, canViewAll));
    } catch {
      // Erro já tratado no serviço
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      await taskService.generateReport(userId);
      // Dados já retornados pelo serviço
    } catch {
      // Erro já tratado no serviço
      const localReport = {
        tasks: tasks.filter(t => t.isActive && moment(t.start).isBetween(moment().startOf('month'), moment().endOf('month'))),
        generatedAt: moment().format('DD/MM/YYYY HH:mm:ss Z'),
      };
      console.log('Relatório local:', localReport);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID,Título,Descrição,Data de Início,Data de Término,Usuário,Grupo,Status'];
    const rows = tasks.map(task => `${task.id},${task.title},${task.description || 'N/A'},${moment(task.start).format('YYYY-MM-DD HH:mm')},${moment(task.end).format('YYYY-MM-DD HH:mm')},${task.user?.name ? `${task.user.name} (${task.user.email})` : 'Não atribuído'},${task.group?.name || 'Não atribuído'},${task.isActive ? 'Ativa' : 'Inativa'}`);
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks_${moment().format('YYYYMMDD_HHmm')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Tarefas exportadas para CSV com sucesso!', { duration: 3000 });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const currentDate = moment().format('DD/MM/YYYY HH:mm:ss Z');
    doc.setFontSize(20);
    doc.text('Relatório de Tarefas', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Gerado em: ${currentDate}`, 105, 28, { align: 'center' });
    let yPos = 40;
    doc.setFontSize(12);
    tasks.forEach((task, index) => {
      if (yPos > 280) { doc.addPage(); yPos = 20; }
      const user = task.user || users.find(u => u.id === task.user?.id);
      const group = task.group || { name: 'Não atribuído' };
      const fields = [
        `Tarefa ${index + 1}:`, `Título: ${task.title}`, `Descrição: ${task.description || 'N/A'}`,
        `Período: ${moment(task.start).format('DD/MM/YYYY HH:mm')} - ${moment(task.end).format('DD/MM/YYYY HH:mm')}`,
        `Usuário: ${user ? `${user.name} (${user.email})` : 'Não atribuído'}`, `Grupo: ${group.name}`, `Status: ${task.isActive ? 'Ativa' : 'Inativa'}`
      ];
      fields.forEach((text, i) => doc.text(text, 10, yPos + i * 10));
      yPos += 70;
    });
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
    }
    doc.save(`tasks_report_${moment().format('YYYYMMDD_HHmm')}.pdf`);
    toast.success('Tarefas exportadas para PDF com sucesso!', { duration: 3000 });
  };

  const getUserDisplayName = user => user ? `${user.name} ${user.surname || ''} (${user.email})` : 'Não identificado';

  const assignFilteredUsers = users.filter(u => u.name.toLowerCase().includes(assignSearchTerm.toLowerCase()) || u.email.toLowerCase().includes(assignSearchTerm.toLowerCase()));
  const createFilteredUsers = users.filter(u => u.name.toLowerCase().includes(createSelectSearchTerm.toLowerCase()) || u.email.toLowerCase().includes(createSelectSearchTerm.toLowerCase()));

  const TaskFormFields = ({ task, setTask, isEdit = false }) => (
    <div className="grid gap-4 py-4">
      {[
        { label: 'Título', id: 'title', type: 'text', placeholder: 'Título da tarefa' },
        { label: 'Descrição', id: 'description', type: 'text', placeholder: 'Descrição' },
        { label: 'Data de Início', id: 'startDate', type: 'datetime-local' },
        { label: 'Data de Término', id: 'endDate', type: 'datetime-local' },
      ].map(field => (
        <div key={field.id}>
          <Label className="text-muted-foreground">{field.label}</Label>
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={task[field.id] || ''}
            onChange={e => setTask(prev => ({ ...prev, [field.id]: e.target.value }))}
            className="bg-input border-border text-foreground"
            disabled={isLoading || (isEdit && isEmployee)}
          />
        </div>
      ))}
      {!isEdit && (
        <>
          <div>
            <Label className="text-muted-foreground">Usuário (Opcional)</Label>
            <Select value={task.userId} onValueChange={value => setTask(prev => ({ ...prev, userId: value }))} disabled={isLoading}>
              <SelectTrigger className="bg-input border-border text-foreground"><SelectValue placeholder="Selecione um usuário (opcional)" /></SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground max-h-[200px] overflow-y-auto">
                <Input
                  placeholder="Pesquisar usuário..."
                  value={createSelectSearchTerm}
                  onChange={e => setCreateSelectSearchTerm(e.target.value)}
                  className="bg-input border-border text-foreground mb-2 p-2 w-full"
                />
                {createFilteredUsers.length ? createFilteredUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>{getUserDisplayName(user)}</SelectItem>
                )) : <div className="p-2 text-muted-foreground text-center">Nenhum usuário encontrado</div>}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-muted-foreground">Grupo (Opcional)</Label>
            <Select value={task.groupId} onValueChange={value => setTask(prev => ({ ...prev, groupId: value }))} disabled={isLoading}>
              <SelectTrigger className="bg-input border-border text-foreground"><SelectValue placeholder="Selecione um grupo (opcional)" /></SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground max-h-[200px] overflow-y-auto">
                {groups.length ? groups.map(group => (
                  <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                )) : <div className="p-2 text-muted-foreground text-center">Nenhum grupo encontrado</div>}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" /></div>;
  if (!isAuthenticated) return <div className="flex justify-center items-center h-screen"><p className="text-muted-foreground">Faça login para acessar o calendário de tarefas.</p></div>;

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-full mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{isEmployee ? 'Minhas Tarefas' : 'Calendário de Tarefas'}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{isEmployee ? 'Visualize suas tarefas atribuídas.' : 'Gerencie as tarefas dos colaboradores.'}</p>
        </div>
        {(canCreate || canGenerateReport) && (
          <div className="flex flex-wrap gap-2">
            {canCreate && <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto min-w-[120px]" disabled={isLoading}>Nova Tarefa</Button>}
            {canGenerateReport && [
              <Button key="report" onClick={handleGenerateReport} className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto min-w-[120px]" disabled={isLoading}>{isLoading ? 'Gerando...' : 'Gerar Relatório'}</Button>,
              <Button key="csv" onClick={exportToCSV} className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto min-w-[120px]" disabled={isLoading}>Exportar CSV</Button>,
              <Button key="pdf" onClick={exportToPDF} className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto min-w-[120px]" disabled={isLoading}>Exportar PDF</Button>,
            ]}
          </div>
        )}
      </div>

      {isEmployee && tasks.length === 0 && !isLoading && (
        <Card className="bg-card border-border"><CardContent className="pt-6"><p className="text-center text-muted-foreground">Nenhuma tarefa atribuída a você. Entre em contato com seu gerente.</p></CardContent></Card>
      )}

      {canViewAll && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-lg sm:text-xl text-foreground">Filtros</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { placeholder: 'Filtrar por usuário (ID)...', value: userId, onChange: setUserId },
                { placeholder: 'Pesquisar usuários por nome ou e-mail...', value: searchTerm, onChange: setSearchTerm },
              ].map((input, i) => (
                <Input key={i} placeholder={input.placeholder} value={input.value} onChange={e => input.onChange(e.target.value)} className="w-full max-w-md bg-input text-foreground border-border pl-8 pr-4 py-2" disabled={isLoading} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-lg sm:text-xl text-foreground">Calendário</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-[600px]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" /></div>
          ) : (
            <div className="relative overflow-x-auto">
              <Calendar
                localizer={localizer}
                events={isEmployee ? tasks.filter(task => task.user?.id === user.id || (task.group && task.group.users?.some(gUser => gUser.id === user.id))) : tasks}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600, minWidth: '100%' }}
                className="w-full"
                onSelectEvent={canEdit ? event => { setSelectedTaskId(event.id); setEditTask({ id: event.id, title: event.title, description: event.description, startDate: moment(event.start).format('YYYY-MM-DDTHH:mm'), endDate: moment(event.end).format('YYYY-MM-DDTHH:mm') }); setIsEditDialogOpen(true); } : undefined}
                eventPropGetter={event => ({ style: { backgroundColor: event.isActive ? '#3b82f6' : '#ef4444', color: 'white', borderRadius: '4px', padding: '2px 5px', fontSize: '0.875rem', whiteSpace: 'normal', overflow: 'visible' } })}
                components={{
                  event: ({ event }) => (
                    <div
                      onMouseEnter={canViewAll ? () => setHoverTask(event) : undefined}
                      onMouseLeave={() => setHoverTask(null)}
                      style={{ backgroundColor: event.isActive ? '#3b82f6' : '#ef4444', color: 'white', padding: '2px 5px', borderRadius: '4px', fontSize: '0.875rem', whiteSpace: 'normal', overflow: 'visible' }}
                    >
                      {event.title} {event.user?.name ? `- ${event.user.name}` : event.group?.name ? `- ${event.group.name}` : ' - Não atribuído'}
                    </div>
                  ),
                  dateCellWrapper: ({ value, children }) => (
                    <div style={{ color: moment(value).isSame(moment(), 'month') ? '#1f2937' : '#6b7280', fontSize: '0.875rem' }}>{children}</div>
                  ),
                }}
                messages={{ today: 'Hoje', previous: 'Anterior', next: 'Próximo', month: 'Mês', week: 'Semana', day: 'Dia', agenda: 'Agenda' }}
              />
              {hoverTask && canViewAll && (
                <div className="absolute bg-card text-foreground p-4 rounded shadow-lg border border-border z-50 max-w-[90%] sm:max-w-[300px]" style={{ top: '20px', left: '20px' }}>
                  {[
                    { label: 'Título', value: hoverTask.title, bold: true },
                    { label: 'Descrição', value: hoverTask.description || 'N/A' },
                    { label: 'Período', value: `${moment(hoverTask.start).format('DD/MM/YYYY HH:mm')} - ${moment(hoverTask.end).format('DD/MM/YYYY HH:mm')}` },
                    { label: 'Usuário', value: hoverTask.user?.name ? `${hoverTask.user.name} (${hoverTask.user.email})` : 'Não atribuído' },
                    { label: 'Grupo', value: hoverTask.group?.name || 'Não atribuído' },
                    { label: 'Status', value: hoverTask.isActive ? 'Ativa' : 'Inativa' },
                  ].map(({ label, value, bold }, i) => (
                    <p key={i} className={`text-xs ${bold ? 'font-bold' : ''}`}>{label}: {value}</p>
                  ))}
                  {canAssign && <Button variant="outline" size="sm" className="mt-2 w-full text-xs" onClick={() => { setSelectedTaskId(hoverTask.id); setAssignUserId(hoverTask.user?.id || ''); setIsAssignDialogOpen(true); }}>Atribuir/Remover</Button>}
                  {canDelete && <Button variant="destructive" size="sm" className="mt-2 w-full text-xs" onClick={() => { setTaskToDelete(hoverTask.id); setIsDeleteDialogOpen(true); }}>Excluir</Button>}
                </div>
              )}
              {tasks.length === 0 && !isEmployee && (
                <div className="text-center text-muted-foreground mt-4">{canCreate ? 'Adicione uma nova tarefa.' : 'Verifique com o administrador.'}</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {canCreate && (
        <Dialog open={isCreateDialogOpen} onOpenChange={open => { setIsCreateDialogOpen(open); if (!open) { setNewTask({ title: '', description: '', startDate: '', endDate: '', userId: '', groupId: '' }); setCreateSelectSearchTerm(''); }}}>
          <DialogContent className="bg-card text-foreground border-border max-w-[90vw] sm:max-w-md">
            <DialogHeader><DialogTitle className="text-lg sm:text-xl">Nova Tarefa</DialogTitle><DialogDescription>Insira os detalhes para uma nova tarefa</DialogDescription></DialogHeader>
            <TaskFormFields task={newTask} setTask={setNewTask} />
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="text-muted-foreground w-full sm:w-auto" disabled={isLoading}>Cancelar</Button>
              <Button onClick={handleCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto" disabled={isLoading}>{isLoading ? 'Criando...' : 'Criar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {canEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-card text-foreground border-border max-w-[90vw] sm:max-w-md">
            <DialogHeader><DialogTitle className="text-lg sm:text-xl">Editar Tarefa</DialogTitle><DialogDescription>Atualize os detalhes da tarefa</DialogDescription></DialogHeader>
            {editTask && <TaskFormFields task={editTask} setTask={setEditTask} isEdit />}
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="text-muted-foreground w-full sm:w-auto" disabled={isLoading}>Cancelar</Button>
              <Button onClick={handleEdit} className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto" disabled={isLoading || isEmployee}>{isLoading ? 'Salvando...' : 'Salvar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {canAssign && (
        <Dialog open={isAssignDialogOpen} onOpenChange={open => { setIsAssignDialogOpen(open); if (!open) { setAssignUserId(''); setAssignSearchTerm(''); }}}>
          <DialogContent className="bg-card text-foreground border-border max-w-[90vw] sm:max-w-md">
            <DialogHeader><DialogTitle className="text-lg sm:text-xl">Gerenciar Tarefa</DialogTitle><DialogDescription>Atribua ou remova a tarefa de um usuário</DialogDescription></DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label className="text-muted-foreground">Pesquisar Usuário</Label>
                <Input placeholder="Digite o nome ou e-mail do usuário..." value={assignSearchTerm} onChange={e => setAssignSearchTerm(e.target.value)} className="bg-input border-border text-foreground mb-2" disabled={isLoading} />
              </div>
              <div>
                <Label className="text-muted-foreground">Usuário</Label>
                <Select value={assignUserId} onValueChange={setAssignUserId} disabled={isLoading}>
                  <SelectTrigger className="bg-input border-border text-foreground"><SelectValue placeholder="Selecione um usuário" /></SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground max-h-[200px] overflow-y-auto">
                    {assignFilteredUsers.length ? assignFilteredUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>{getUserDisplayName(user)}</SelectItem>
                    )) : <div className="p-2 text-muted-foreground text-center">Nenhum usuário encontrado</div>}
                  </SelectContent>
                </Select>
              </div>
              <Select onValueChange={value => value === 'assign' ? handleAssign() : handleRemove()} disabled={isLoading || !assignUserId}>
                <SelectTrigger className="bg-input border-border text-foreground"><SelectValue placeholder="Selecione uma ação" /></SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="assign">Atribuir Tarefa</SelectItem>
                  <SelectItem value="remove">Remover Tarefa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)} className="text-muted-foreground w-full sm:w-auto" disabled={isLoading}>Cancelar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {canDelete && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-card text-foreground border-border max-w-md">
            <DialogHeader><DialogTitle>Confirmar Exclusão</DialogTitle><DialogDescription>Você tem certeza que deseja excluir esta tarefa permanentemente? Tarefa: {tasks.find(task => task.id === taskToDelete)?.title || 'Não identificada'}.</DialogDescription></DialogHeader>
            <DialogFooter className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setIsDeleteDialogOpen(false); setTaskToDelete(null); }} className="text-muted-foreground" disabled={isLoading}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDeleteTask} disabled={isLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{isLoading ? 'Excluindo...' : 'Confirmar Exclusão'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CalendarPage;