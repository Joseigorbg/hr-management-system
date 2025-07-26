import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Calendar, X } from 'lucide-react';
import { departmentService } from '../services/departmentService';

const DepartmentForm = ({ department, setDepartment, users, errors, onSubmit, onCancel, title, description, submitText, isLoading }) => (
  <DialogContent className="bg-card text-foreground border-border max-w-[90vw] sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
    </DialogHeader>
    <div className="space-y-6 mt-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="text-lg">
            {(users.find(u => u.id === department.managerId)?.name || '')
              .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'ND'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-semibold">{department.name || 'Novo Departamento'}</h3>
          <p className="text-muted-foreground">Departamento</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={department.name || ''}
            onChange={e => setDepartment({ ...department, name: e.target.value })}
            className="w-full mt-1"
            disabled={isLoading}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        <div>
          <Label htmlFor="managerId">Gestor</Label>
          <Select
            value={department.managerId || 'none'}
            onValueChange={value => setDepartment({ ...department, managerId: value })}
            disabled={isLoading}
          >
            <SelectTrigger id="managerId" className="w-full mt-1">
              <SelectValue placeholder="Selecione o gestor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum gestor</SelectItem>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            value={department.description || ''}
            onChange={e => setDepartment({ ...department, description: e.target.value })}
            className="w-full mt-1"
            disabled={isLoading}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
      </div>
      <div className="mt-4 text-sm text-muted-foreground">
        <strong>Resumo:</strong> Nome: {department.name || 'Não informado'}, Gestor: {users.find(u => u.id === department.managerId)?.name || 'Não informado'}
      </div>
    </div>
    <DialogFooter className="mt-6 flex justify-end gap-3">
      <Button variant="outline" onClick={onCancel} className="text-muted-foreground" disabled={isLoading}>
        Cancelar
      </Button>
      <Button onClick={onSubmit} disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
        {submitText}
      </Button>
    </DialogFooter>
  </DialogContent>
);

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersData, departmentsData] = await Promise.all([
        departmentService.fetchUsers(),
        departmentService.fetchDepartments({ searchTerm, startDate, endDate }),
      ]);
      setUsers(usersData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar os dados. Verifique a conexão.', { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveDepartment = async (department, isEdit = false) => {
    setIsLoading(true);
    const { success, errors } = isEdit
      ? await departmentService.updateDepartment(department)
      : await departmentService.createDepartment(department);
    if (success) {
      await fetchData();
      setIsCreateDialogOpen(false);
      setSelectedDepartment(null);
      setErrors({});
    } else if (errors) {
      setErrors(errors);
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    const { success } = await departmentService.deleteDepartment(departmentToDelete);
    if (success) {
      await fetchData();
      setIsDeleteDialogOpen(false);
      setDepartmentToDelete(null);
    }
    setIsLoading(false);
  };

  const handleGenerateReport = async () => {
    setIsLoading(true);
    await departmentService.generateReport({ startDate, endDate });
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Departamentos</h1>
          <p className="text-muted-foreground">Gerencie os departamentos da empresa</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleGenerateReport} disabled={!startDate || !endDate || isLoading} className="min-w-[120px]">
            Gerar Relatório
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[150px]">
            <Plus className="mr-2 h-4 w-4" /> Novo Departamento
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle>Filtros de Pesquisa</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, descrição ou gestor..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 bg-input text-foreground border-border"
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="pl-8"
                disabled={isLoading}
              />
            </div>
            <div className="relative flex items-center">
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="pl-8"
                disabled={isLoading}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); }}
                className="ml-2 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle>Lista de Departamentos ({departments.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : departments.length === 0 ? (
            <Table><TableBody><TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum departamento encontrado</TableCell></TableRow></TableBody></Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Gestor</TableHead>
                  <TableHead>Usuários</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map(dept => (
                  <TableRow key={dept.id}>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell>{dept.description || 'Não informado'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-sm bg-muted">
                            {(users.find(u => u.id === dept.managerId)?.name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'ND'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{users.find(u => u.id === dept.managerId)?.name || 'Não Definido'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{dept.employee_count ?? 'Nenhum usuário'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-accent-foreground hover:text-accent"
                              onClick={() => setSelectedDepartment({ ...dept, managerId: dept.managerId || 'none' })}
                              disabled={isLoading}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DepartmentForm
                            department={selectedDepartment || {}}
                            setDepartment={setSelectedDepartment}
                            users={users}
                            errors={errors}
                            onSubmit={() => handleSaveDepartment(selectedDepartment, true)}
                            onCancel={() => setSelectedDepartment(null)}
                            title="Editar Departamento"
                            description={`Atualize os detalhes de ${selectedDepartment?.name}`}
                            submitText="Salvar Alterações"
                            isLoading={isLoading}
                          />
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/80"
                          onClick={() => { setDepartmentToDelete(dept.id); setIsDeleteDialogOpen(true); }}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DepartmentForm
          department={{ name: '', description: '', managerId: 'none' }}
          setDepartment={setNewDepartment => setNewDepartment(setNewDepartment)}
          users={users}
          errors={errors}
          onSubmit={() => handleSaveDepartment(setNewDepartment({ name: '', description: '', managerId: 'none' }))}
          onCancel={() => { setIsCreateDialogOpen(false); setErrors({}); }}
          title="Novo Departamento"
          description="Preencha os dados para registrar um novo departamento"
          submitText="Criar Departamento"
          isLoading={isLoading}
        />
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card text-foreground border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir permanentemente este departamento? Esta ação não pode ser desfeita. Departamento: {departments.find(dept => dept.id === departmentToDelete)?.name || 'Não identificado'}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setIsDeleteDialogOpen(false); setDepartmentToDelete(null); }} className="text-muted-foreground" disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isLoading ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Departments;