import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Plus, Edit, Trash2, Eye, ChevronsUpDown, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '../contexts/AuthContext';
import { evaluationService } from '../services/evaluationService';

const InputField = ({ label, value, onChange, disabled, placeholder, type = 'text', error, selectOptions }) => (
  <div>
    <Label>{label}</Label>
    {selectOptions ? (
      <select value={value || 'pending'} onChange={onChange} className="w-full p-2 bg-input border-border rounded-md" disabled={disabled}>
        {selectOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    ) : (
      <Input type={type} value={value || ''} onChange={onChange} className="bg-input border-border" placeholder={placeholder} disabled={disabled} {...(type === 'number' ? { step: '0.1', min: '0', max: '10' } : {})} />
    )}
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const UserSelect = ({ isEdit, isView, evaluation, setEvaluation, users, field, label, error }) => (
  <div>
    <Label>{label}</Label>
    {isEdit || isView ? (
      <Input value={evaluation[field === 'userId' ? 'users_performance_evaluations_user_idTousers' : 'users_performance_evaluations_evaluator_idTousers']?.name || evaluation[field === 'userId' ? 'userName' : 'evaluatorName'] || ''} className="bg-input border-border" disabled />
    ) : (
      <Popover open={evaluation[field === 'userId' ? 'openUserSelect' : 'openEvaluatorSelect']} onOpenChange={open => setEvaluation({ ...evaluation, [field === 'userId' ? 'openUserSelect' : 'openEvaluatorSelect']: open })}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between bg-input border-border hover:bg-muted/50">
            {evaluation[field === 'userId' ? 'userName' : 'evaluatorName'] || `Selecione um ${label.toLowerCase()}...`} <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 bg-card border-border">
          <Command className="bg-card">
            <CommandInput placeholder={`Buscar ${label.toLowerCase()}...`} />
            <CommandList className="max-h-[200px] overflow-y-auto">
              <CommandEmpty>Nenhum {label.toLowerCase()} encontrado.</CommandEmpty>
              <CommandGroup>
                {users.map(user => (
                  <CommandItem
                    key={user.id}
                    value={`${user.name} ${user.surname || ''}`}
                    onSelect={() => setEvaluation({ ...evaluation, [field]: user.id, [field === 'userId' ? 'userName' : 'evaluatorName']: `${user.name} ${user.surname || ''}`, [field === 'userId' ? 'openUserSelect' : 'openEvaluatorSelect']: false })}
                    className="hover:bg-muted"
                  >
                    <Check className={`mr-2 h-4 w-4 ${evaluation[field] === user.id ? 'opacity-100' : 'opacity-0'}`} />
                    {user.name} {user.surname || ''} ({user.email})
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )}
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const EvaluationForm = ({ evaluation, setEvaluation, users, errors, onSubmit, onCancel, isEdit, isView, isLoading }) => (
  <DialogContent className="max-w-[90vw] sm:max-w-lg md:max-w-2xl bg-card border-border max-h-[85vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{isView ? 'Detalhes' : isEdit ? 'Editar' : 'Nova'} Avaliação</DialogTitle>
      <DialogDescription>{`${isView ? 'Visualizando' : isEdit ? 'Atualize' : 'Insira'} detalhes da avaliação de ${evaluation?.users_performance_evaluations_user_idTousers?.name || evaluation?.userName || 'Não definido'}`}</DialogDescription>
    </DialogHeader>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <UserSelect isEdit={isEdit} isView={isView} evaluation={evaluation} setEvaluation={setEvaluation} users={users} field="userId" label="Colaborador" error={errors.userId} />
      <UserSelect isEdit={isEdit} isView={isView} evaluation={evaluation} setEvaluation={setEvaluation} users={users} field="evaluatorId" label="Avaliador" error={errors.evaluatorId} />
      <InputField label="Período" value={evaluation.period} onChange={e => setEvaluation({ ...evaluation, period: e.target.value })} disabled={isLoading || isView} placeholder="Q1-2025" error={errors.period} />
      <InputField label="Pontuação" type="number" value={evaluation.score} onChange={e => setEvaluation({ ...evaluation, score: e.target.value })} disabled={isLoading || isView} placeholder="0.0 a 10.0" error={errors.score} />
      <div className="col-span-2"><InputField label="Metas" value={evaluation.goals} onChange={e => setEvaluation({ ...evaluation, goals: e.target.value })} disabled={isLoading || isView} placeholder="Aumentar vendas" /></div>
      <div className="col-span-2"><InputField label="Conquistas" value={evaluation.achievements} onChange={e => setEvaluation({ ...evaluation, achievements: e.target.value })} disabled={isLoading || isView} placeholder="Progresso de 70%" /></div>
      <div className="col-span-2"><InputField label="Feedback" value={evaluation.feedback} onChange={e => setEvaluation({ ...evaluation, feedback: e.target.value })} disabled={isLoading || isView} placeholder="Bom progresso" /></div>
      <InputField label="Status" value={evaluation.status} onChange={e => setEvaluation({ ...evaluation, status: e.target.value })} disabled={isLoading || isView} selectOptions={[{ value: 'pending', label: 'Pendente' }, { value: 'completed', label: 'Concluído' }, { value: 'approved', label: 'Aprovado' }]} />
    </div>
    {errors.general && <p className="text-red-500 text-sm mt-2">{errors.general}</p>}
    <DialogFooter className="mt-4 flex justify-end gap-2">
      <Button variant="outline" onClick={onCancel} disabled={isLoading}>{isView ? 'Fechar' : 'Cancelar'}</Button>
      {!isView && <Button onClick={onSubmit} disabled={isLoading}>{isEdit ? 'Salvar' : 'Criar'}</Button>}
    </DialogFooter>
  </DialogContent>
);

const PerformanceEvaluations = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'manager';
  const [evaluations, setEvaluations] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialog, setDialog] = useState({ type: '', data: null });
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const initialEvaluation = { userId: '', userName: '', evaluatorId: user?.id || '', evaluatorName: user?.name || '', period: '', score: '', goals: '', achievements: '', feedback: '', status: 'pending', openUserSelect: false, openEvaluatorSelect: false };
  const [newEvaluation, setNewEvaluation] = useState(initialEvaluation);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersData, evaluationsData] = await Promise.all([isAdmin ? evaluationService.fetchUsers() : [], evaluationService.fetchEvaluations(user, isAdmin)]);
      setUsers(usersData);
      setEvaluations(evaluationsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredEvaluations = isAdmin ? evaluations.filter(e => [e.users_performance_evaluations_user_idTousers?.name, e.users_performance_evaluations_user_idTousers?.email, e.users_performance_evaluations_user_idTousers?.department?.name, e.users_performance_evaluations_evaluator_idTousers?.name, e.period].filter(Boolean).some(f => f.toLowerCase().includes(searchTerm.toLowerCase()))) : evaluations;

  const handleSave = async (evaluation, isEdit = false) => {
    setIsLoading(true);
    const { success, errors } = isEdit ? await evaluationService.updateEvaluation(evaluation, evaluations) : await evaluationService.createEvaluation(evaluation, evaluations);
    if (success) {
      await fetchData();
      setDialog({ type: '', data: null });
      setNewEvaluation(initialEvaluation);
      setErrors({});
    } else if (errors) {
      setErrors(errors);
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    if (await evaluationService.deleteEvaluation(dialog.data)) {
      await fetchData();
      setDialog({ type: '', data: null });
    }
    setIsLoading(false);
  };

  const openDialog = (type, data) => setDialog({ type, data: { ...data, user_id: data?.user_id, evaluator_id: data?.evaluator_id, score: data?.score?.toString() || '', goals: data?.goals || '', achievements: data?.achievements || '', feedback: data?.feedback || '', status: data?.status || 'pending' } });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Avaliações de Desempenho</h1>
          <p className="text-muted-foreground">{isAdmin ? 'Gerencie as avaliações' : 'Veja suas avaliações'}</p>
        </div>
        {isAdmin && <Button onClick={() => setDialog({ type: 'create', data: initialEvaluation })} disabled={isLoading}><Plus className="mr-2 h-4 w-4" />Nova Avaliação</Button>}
      </div>

      {isAdmin && (
        <Card>
          <CardHeader><CardTitle>Buscar</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por nome, email, departamento ou período..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 bg-input border-border" disabled={isLoading} />
              </div>
              <Button variant="outline" disabled={isLoading}>Filtros</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Lista ({filteredEvaluations.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" /></div>
          ) : filteredEvaluations.length === 0 ? (
            <Table><TableBody><TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Nenhuma avaliação</TableCell></TableRow></TableBody></Table>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Colaborador</TableHead><TableHead>Departamento</TableHead><TableHead>Período</TableHead><TableHead>Pontuação</TableHead><TableHead>Avaliador</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredEvaluations.map(e => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8 bg-muted">
                          <AvatarFallback className="text-sm">{(e.users_performance_evaluations_user_idTousers?.name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'ND'}</AvatarFallback>
                        </Avatar>
                        <div><p>{e.users_performance_evaluations_user_idTousers?.name || 'Não definido'}</p><p className="text-xs text-muted-foreground">{e.users_performance_evaluations_user_idTousers?.email || 'Não definido'}</p></div>
                      </div>
                    </TableCell>
                    <TableCell>{e.users_performance_evaluations_user_idTousers?.department?.name || 'Não definido'}</TableCell>
                    <TableCell>{e.period || 'Não definido'}</TableCell>
                    <TableCell>{e.score ? e.score.toFixed(1) : 'N/D'}</TableCell>
                    <TableCell>{e.users_performance_evaluations_evaluator_idTousers?.name || 'Não definido'}</TableCell>
                    <TableCell><Badge className={{ completed: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-blue-100 text-blue-800' }[e.status] || 'bg-gray-100 text-gray-800'}>{e.status || 'Não definido'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => openDialog('view', e)} disabled={isLoading}><Eye className="h-4 w-4" /></Button>
                        {isAdmin && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => openDialog('edit', e)} disabled={isLoading}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDialog('delete', { id: e.id })} disabled={isLoading}><Trash2 className="h-4 w-4" /></Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialog.type === 'create' || dialog.type === 'view' || dialog.type === 'edit'} onOpenChange={open => !open && setDialog({ type: '', data: null })}>
        {(dialog.type === 'create' || dialog.type === 'view' || dialog.type === 'edit') && (
          <EvaluationForm
            evaluation={dialog.type === 'create' ? newEvaluation : dialog.data}
            setEvaluation={dialog.type === 'create' ? setNewEvaluation : setDialog.bind(null, { ...dialog, data: { ...dialog.data } })}
            users={users}
            errors={errors}
            onSubmit={() => handleSave(dialog.type === 'create' ? newEvaluation : dialog.data, dialog.type === 'edit')}
            onCancel={() => setDialog({ type: '', data: null })}
            isEdit={dialog.type === 'edit'}
            isView={dialog.type === 'view'}
            isLoading={isLoading}
          />
        )}
      </Dialog>

      {isAdmin && (
        <Dialog open={dialog.type === 'delete'} onOpenChange={open => !open && setDialog({ type: '', data: null })}>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Deseja excluir a avaliação de {evaluations.find(e => e.id === dialog.data?.id)?.users_performance_evaluations_user_idTousers?.name || 'Não identificado'} ({evaluations.find(e => e.id === dialog.data?.id)?.period || 'Período não identificado'})?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialog({ type: '', data: null })} disabled={isLoading}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>{isLoading ? 'Excluindo...' : 'Confirmar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PerformanceEvaluations;