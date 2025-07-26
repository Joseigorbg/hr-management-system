import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { api } from '../contexts/AuthContext';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    hireDate: '',
    salary: '',
    contractType: 'CLT',
    positionId: '',
    departmentId: '',
    status: 'active',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([fetchPositions(), fetchDepartments(), fetchEmployees()]);
      } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err);
        toast.error('Erro ao carregar os dados. Verifique a conexão ou tente novamente.', { duration: 3000 });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [searchTerm]);

  const fetchPositions = async () => {
    try {
      await api.get('/positions').then(({ data }) => {
        setPositions(Array.isArray(data.data) ? data.data : []);
      });
    } catch (err) {
      console.error('Erro ao buscar cargos:', err.response?.data || err.message);
      toast.error('Erro ao carregar cargos', { duration: 3000 });
      setPositions([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      await api.get('/departments').then(({ data }) => {
        setDepartments(Array.isArray(data.data) ? data.data : []);
      });
    } catch (err) {
      console.error('Erro ao buscar departamentos:', err.response?.data || err.message);
      toast.error('Erro ao carregar departamentos', { duration: 3000 });
      setDepartments([]);
    }
  };

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const params = { page: 1, limit: 10, include: 'admission' };
      if (searchTerm) params.search = searchTerm;
      await api.get('/users', { params }).then(({ data }) => {
        setEmployees(Array.isArray(data.data) ? data.data : []);
      });
    } catch (err) {
      console.error('Erro ao buscar colaboradores:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Erro ao carregar colaboradores', { duration: 3000 });
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmployee = (employee, isUpdate = false) => {
    const newErrors = {};
    if (!employee.name?.trim()) newErrors.name = 'Nome é obrigatório';
    if (!employee.surname?.trim()) newErrors.surname = 'Sobrenome é obrigatório'; // Adicionado
    if (!employee.email?.trim()) newErrors.email = 'Email é obrigatório';
    if (!isUpdate && !employee.password?.trim()) newErrors.password = 'Senha é obrigatória';
    if (employee.password && employee.password.length < 6) newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    if (!employee.hireDate) newErrors.hireDate = 'Data de admissão é obrigatória';
    if (!employee.salary || isNaN(parseFloat(employee.salary)))
      newErrors.salary = 'Salário é obrigatório e deve ser um número válido';
    if (!employee.positionId) newErrors.positionId = 'Cargo é obrigatório';
    if (!employee.departmentId) newErrors.departmentId = 'Departamento é obrigatório';
    // Basic email format validation
    if (employee.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email))
      newErrors.email = 'Email inválido';
    return newErrors;
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    const validationErrors = validateEmployee(newEmployee);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Preencha todos os campos obrigatórios corretamente', { duration: 3000 });
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/users', {
        name: newEmployee.name,
        surname: newEmployee.surname, // Incluído
        email: newEmployee.email,
        password: newEmployee.password,
        role: 'employee',
        positionId: newEmployee.positionId,
        departmentId: newEmployee.departmentId,
        hireDate: newEmployee.hireDate,
        salary: parseFloat(newEmployee.salary),
        contractType: newEmployee.contractType,
        status: newEmployee.status,
      });
      toast.success('Colaborador criado com sucesso!', { duration: 3000 });
      await fetchEmployees();
      setIsCreateDialogOpen(false);
      setNewEmployee({
        name: '',
        surname: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        hireDate: '',
        salary: '',
        contractType: 'CLT',
        positionId: '',
        departmentId: '',
        status: 'active',
      });
      setErrors({});
    } catch (err) {
      console.error('Erro ao criar colaborador:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Erro ao criar colaborador', { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    const validationErrors = validateEmployee(selectedEmployee, true);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Preencha todos os campos obrigatórios corretamente', { duration: 3000 });
      return;
    }
    setIsLoading(true);
    try {
      const updateData = {
        name: selectedEmployee.name,
        surname: selectedEmployee.surname, // Incluído explicitamente
        email: selectedEmployee.email,
        positionId: selectedEmployee.positionId,
        departmentId: selectedEmployee.departmentId,
        hireDate: selectedEmployee.hireDate,
        salary: parseFloat(selectedEmployee.salary),
        contractType: selectedEmployee.contractType,
        status: selectedEmployee.status,
      };
      if (selectedEmployee.password) {
        updateData.password = selectedEmployee.password;
      }
      console.log('Enviando payload para atualização:', updateData); // Debug payload
      await api.patch(`/users/${selectedEmployee.id}`, updateData);
      toast.success('Colaborador atualizado com sucesso!', { duration: 3000 });
      await fetchEmployees();
      setSelectedEmployee(null);
      setErrors({});
    } catch (err) {
      console.error('Erro ao atualizar colaborador:', err.response?.data || err.message);
      toast.error(
        err.response?.data?.message || 'Erro ao atualizar colaborador. Verifique os dados enviados.',
        { duration: 3000 }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    setIsLoading(true);
    try {
      await api.delete(`/users/${employeeToDelete}`);
      toast.success('Colaborador desativado com sucesso!', { duration: 3000 });
      setIsDeleteDialogOpen(false);
      setEmployeeToDelete(null);
      await fetchEmployees();
    } catch (err) {
      console.error('Erro ao desativar colaborador:', err.response?.data || err.message);
      const errorMessage = err.response?.status === 404
        ? 'Colaborador não encontrado.'
        : err.response?.status === 403
        ? 'Você não tem permissão para desativar este colaborador.'
        : err.response?.data?.message || 'Erro ao desativar colaborador. Tente novamente.';
      toast.error(errorMessage, { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDeleteDialog = (id) => {
    setEmployeeToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const getStatusLabel = (isActive, admissionStatus) => {
    if (!isActive) return 'Inativo';
    switch (admissionStatus) {
      case 'active':
        return 'Ativo';
      case 'vacation':
        return 'Férias';
      case 'inactive':
        return 'Inativo';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-100 text-green-800';
      case 'Férias':
        return 'bg-blue-100 text-blue-800';
      case 'Inativo':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserInitials = (name) => {
    return name
      ? name
          .split(' ')
          .map((word) => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'ND';
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 min-w-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Colaboradores</h1>
          <p className="text-muted-foreground">Gerencie os colaboradores da empresa</p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[150px]"
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Colaborador
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Buscar Colaboradores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, cargo ou departamento..."
              value={searchTerm ?? ''}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-input text-foreground border-border w-full"
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Lista de Colaboradores ({employees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum colaborador encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback className="text-sm bg-muted">
                              {getUserInitials(employee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{employee.name} {employee.surname}</div>
                            <div className="text-sm text-muted-foreground">{employee.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.position?.name || 'Não definido'}</TableCell>
                      <TableCell>{employee.department?.name || 'Não definido'}</TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(getStatusLabel(employee.isActive, employee.admissions?.status))}
                        >
                          {getStatusLabel(employee.isActive, employee.admissions?.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-accent-foreground hover:text-accent"
                            onClick={() =>
                              setSelectedEmployee({
                                ...employee,
                                phone: employee.profile?.phone || '',
                                address: employee.profile?.address || '',
                                hireDate: employee.admissions?.hireDate?.split('T')[0] || '',
                                salary: employee.admissions?.salary?.toString() || '',
                                contractType: employee.admissions?.contractType || 'CLT',
                                status: employee.admissions?.status || 'active',
                                positionId: employee.positionId || '',
                                departmentId: employee.departmentId || '',
                                password: '',
                              })
                            }
                            disabled={isLoading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive/80"
                            onClick={() => handleOpenDeleteDialog(employee.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-card text-foreground border-border max-w-[90vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Criar Novo Colaborador</DialogTitle>
            <DialogDescription>Insira os detalhes para um novo colaborador</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateEmployee}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name-create">Nome</Label>
                <Input
                  id="name-create"
                  value={newEmployee.name ?? ''}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="mt-1"
                  disabled={isLoading}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="surname-create">Sobrenome</Label>
                <Input
                  id="surname-create"
                  value={newEmployee.surname ?? ''}
                  onChange={(e) => setNewEmployee({ ...newEmployee, surname: e.target.value })}
                  className="mt-1"
                  disabled={isLoading}
                />
                {errors.surname && <p className="text-red-500 text-sm mt-1">{errors.surname}</p>}
              </div>
              <div>
                <Label htmlFor="email-create">Email</Label>
                <Input
                  id="email-create"
                  type="email"
                  value={newEmployee.email ?? ''}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  className="mt-1"
                  disabled={isLoading}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="password-create">Senha</Label>
                <Input
                  id="password-create"
                  type="password"
                  value={newEmployee.password ?? ''}
                  onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                  className="mt-1"
                  disabled={isLoading}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              <div>
                <Label htmlFor="phone-create">Telefone</Label>
                <Input
                  id="phone-create"
                  value={newEmployee.phone ?? ''}
                  onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  className="mt-1"
                  disabled={isLoading}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              <div>
                <Label htmlFor="address-create">Endereço</Label>
                <Input
                  id="address-create"
                  value={newEmployee.address ?? ''}
                  onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })}
                  className="mt-1"
                  disabled={isLoading}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
              <div>
                <Label htmlFor="hireDate-create">Data de Admissão</Label>
                <Input
                  id="hireDate-create"
                  type="date"
                  value={newEmployee.hireDate ?? ''}
                  onChange={(e) => setNewEmployee({ ...newEmployee, hireDate: e.target.value })}
                  className="mt-1"
                  disabled={isLoading}
                />
                {errors.hireDate && <p className="text-red-500 text-sm mt-1">{errors.hireDate}</p>}
              </div>
              <div>
                <Label htmlFor="salary-create">Salário</Label>
                <Input
                  id="salary-create"
                  type="number"
                  value={newEmployee.salary ?? ''}
                  onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                  className="mt-1"
                  disabled={isLoading}
                />
                {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
              </div>
              <div>
                <Label htmlFor="contractType-create">Tipo de Contrato</Label>
                <Select
                  value={newEmployee.contractType}
                  onValueChange={(value) => setNewEmployee({ ...newEmployee, contractType: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger id="contractType-create" className="mt-1">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="Estágio">Estágio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="positionId-create">Cargo</Label>
                <Select
                  value={newEmployee.positionId}
                  onValueChange={(value) => setNewEmployee({ ...newEmployee, positionId: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger id="positionId-create" className="mt-1">
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position.id} value={position.id}>
                        {position.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.positionId && <p className="text-red-500 text-sm mt-1">{errors.positionId}</p>}
              </div>
              <div>
                <Label htmlFor="departmentId-create">Departamento</Label>
                <Select
                  value={newEmployee.departmentId}
                  onValueChange={(value) => setNewEmployee({ ...newEmployee, departmentId: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger id="departmentId-create" className="mt-1">
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.departmentId && <p className="text-red-500 text-sm mt-1">{errors.departmentId}</p>}
              </div>
              <div>
                <Label htmlFor="status-create">Status</Label>
                <Select
                  value={newEmployee.status}
                  onValueChange={(value) => setNewEmployee({ ...newEmployee, status: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger id="status-create" className="mt-1">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="vacation">Férias</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setErrors({});
                }}
                className="text-muted-foreground"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Criar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="bg-card text-foreground border-border max-w-[90vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Editar Colaborador</DialogTitle>
            <DialogDescription>Atualize os detalhes de {selectedEmployee?.name ?? 'Novo Colaborador'}</DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <form onSubmit={handleUpdateEmployee}>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-lg bg-muted">
                      {getUserInitials(selectedEmployee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedEmployee.name} {selectedEmployee.surname}</h3>
                    <p className="text-muted-foreground">{selectedEmployee.position?.name || 'Não definido'}</p>
                    <Badge
                      className={getStatusColor(getStatusLabel(selectedEmployee.isActive, selectedEmployee.status))}
                    >
                      {getStatusLabel(selectedEmployee.isActive, selectedEmployee.status)}
                    </Badge>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name-edit">Nome</Label>
                      <Input
                        id="name-edit"
                        value={selectedEmployee.name ?? ''}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, name: e.target.value })}
                        className="mt-1"
                        disabled={isLoading}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="surname-edit">Sobrenome</Label>
                      <Input
                        id="surname-edit"
                        value={selectedEmployee.surname ?? ''}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, surname: e.target.value })}
                        className="mt-1"
                        disabled={isLoading}
                      />
                      {errors.surname && <p className="text-red-500 text-sm mt-1">{errors.surname}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email-edit">Email</Label>
                      <Input
                        id="email-edit"
                        type="email"
                        value={selectedEmployee.email ?? ''}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, email: e.target.value })}
                        className="mt-1"
                        disabled={isLoading}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="password-edit">Nova Senha (deixe em branco para não alterar)</Label>
                      <Input
                        id="password-edit"
                        type="password"
                        value={selectedEmployee.password ?? ''}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, password: e.target.value })}
                        className="mt-1"
                        disabled={isLoading}
                      />
                      {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone-edit">Telefone</Label>
                      <Input
                        id="phone-edit"
                        value={selectedEmployee.phone ?? ''}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, phone: e.target.value })}
                        className="mt-1"
                        disabled={isLoading}
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <Label htmlFor="address-edit">Endereço</Label>
                      <Input
                        id="address-edit"
                        value={selectedEmployee.address ?? ''}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, address: e.target.value })}
                        className="mt-1"
                        disabled={isLoading}
                      />
                      {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="departmentId-edit">Departamento</Label>
                      <Select
                        value={selectedEmployee.departmentId ?? ''}
                        onValueChange={(value) => setSelectedEmployee({ ...selectedEmployee, departmentId: value })}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="departmentId-edit" className="mt-1">
                          <SelectValue placeholder="Selecione o departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((department) => (
                            <SelectItem key={department.id} value={department.id}>
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.departmentId && <p className="text-red-500 text-sm mt-1">{errors.departmentId}</p>}
                    </div>
                    <div>
                      <Label htmlFor="positionId-edit">Cargo</Label>
                      <Select
                        value={selectedEmployee.positionId ?? ''}
                        onValueChange={(value) => setSelectedEmployee({ ...selectedEmployee, positionId: value })}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="positionId-edit" className="mt-1">
                          <SelectValue placeholder="Selecione o cargo" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((position) => (
                            <SelectItem key={position.id} value={position.id}>
                              {position.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.positionId && <p className="text-red-500 text-sm mt-1">{errors.positionId}</p>}
                    </div>
                    <div>
                      <Label htmlFor="hireDate-edit">Data de Admissão</Label>
                      <Input
                        id="hireDate-edit"
                        type="date"
                        value={selectedEmployee.hireDate ?? ''}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, hireDate: e.target.value })}
                        className="mt-1"
                        disabled={isLoading}
                      />
                      {errors.hireDate && <p className="text-red-500 text-sm mt-1">{errors.hireDate}</p>}
                    </div>
                    <div>
                      <Label htmlFor="salary-edit">Salário</Label>
                      <Input
                        id="salary-edit"
                        type="number"
                        value={selectedEmployee.salary ?? ''}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, salary: e.target.value })}
                        className="mt-1"
                        disabled={isLoading}
                      />
                      {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
                    </div>
                    <div>
                      <Label htmlFor="contractType-edit">Tipo de Contrato</Label>
                      <Select
                        value={selectedEmployee.contractType ?? 'CLT'}
                        onValueChange={(value) => setSelectedEmployee({ ...selectedEmployee, contractType: value })}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="contractType-edit" className="mt-1">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CLT">CLT</SelectItem>
                          <SelectItem value="PJ">PJ</SelectItem>
                          <SelectItem value="Estágio">Estágio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status-edit">Status</Label>
                      <Select
                        value={selectedEmployee.status ?? 'active'}
                        onValueChange={(value) => setSelectedEmployee({ ...selectedEmployee, status: value })}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="status-edit" className="mt-1">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="vacation">Férias</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setSelectedEmployee(null);
                    setErrors({});
                  }}
                  className="text-muted-foreground"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card text-foreground border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Desativação</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja desativar este colaborador? Esta ação não pode be desfeita. Colaborador: {' '}
              {employees.find((emp) => emp.id === employeeToDelete)?.name || 'Não identificado'} {' '}
              {employees.find((emp) => emp.id === employeeToDelete)?.surname || ''}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setEmployeeToDelete(null);
              }}
              className="text-muted-foreground"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEmployee}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Desativando...' : 'Confirmar Desativação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;