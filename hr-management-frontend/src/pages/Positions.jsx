import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { debounce } from 'lodash';
import { api } from '../contexts/AuthContext';

const Positions = () => {
  const { user } = useAuth();
  const [positions, setPositions] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [newPosition, setNewPosition] = useState({
    name: '',
    description: '',
    salary: '',
    status: 'Não definido',
  });

  const fetchPositions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/positions', {
        params: { page: 1, limit: 10, search },
      });
      setPositions(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error('Erro ao buscar posições:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Erro ao carregar cargos. Verifique o backend.');
      setPositions([]);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  const debouncedFetchPositions = useCallback(
    debounce(() => fetchPositions(), 300),
    [fetchPositions]
  );

  useEffect(() => {
    debouncedFetchPositions();
    return () => debouncedFetchPositions.cancel();
  }, [debouncedFetchPositions]);

  const validatePosition = (position) => {
    const newErrors = {};
    if (!position.name?.trim()) newErrors.name = 'Nome é obrigatório';
    if (position.salary && isNaN(parseFloat(position.salary)))
      newErrors.salary = 'Salário deve ser um número válido';
    return newErrors;
  };

  const handleCreatePosition = async () => {
    const validationErrors = validatePosition(newPosition);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Preencha todos os campos obrigatórios corretamente');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/positions', {
        name: newPosition.name,
        description: newPosition.description || '',
        salary: newPosition.salary ? parseFloat(newPosition.salary) : null,
        status: newPosition.status,
      });
      toast.success('Cargo criado com sucesso!', { duration: 3000 });
      await fetchPositions();
      setIsCreateDialogOpen(false);
      setNewPosition({
        name: '',
        description: '',
        salary: '',
        status: 'Não definido',
      });
      setErrors({});
    } catch (err) {
      console.error('Erro ao criar cargo:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Erro ao criar cargo', { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePosition = async () => {
    if (!selectedPosition) return;
    const validationErrors = validatePosition(selectedPosition);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Preencha todos os campos obrigatórios corretamente');
      return;
    }
    setIsLoading(true);
    try {
      await api.patch(`/positions/${selectedPosition.id}`, {
        name: selectedPosition.name,
        description: selectedPosition.description || '',
        salary: selectedPosition.salary ? parseFloat(selectedPosition.salary) : null,
        status: selectedPosition.status || 'Não definido',
      });
      toast.success('Cargo atualizado com sucesso!', { duration: 3000 });
      await fetchPositions();
      setSelectedPosition(null);
      setErrors({});
    } catch (err) {
      console.error('Erro ao atualizar cargo:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Erro ao atualizar cargo', { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!positionToDelete) return;
    setIsLoading(true);
    try {
      await api.delete(`/positions/${positionToDelete}`);
      toast.success('Cargo excluído com sucesso!', { duration: 3000 });
      setIsDeleteDialogOpen(false);
      setPositionToDelete(null);
      await fetchPositions();
    } catch (err) {
      console.error('Erro ao excluir cargo:', err.response?.data || err.message);
      const errorMessage = err.response?.status === 404
        ? 'Cargo não encontrado.'
        : err.response?.status === 403
        ? 'Você não tem permissão para excluir este cargo.'
        : err.response?.data?.message || 'Erro ao excluir cargo. Tente novamente.';
      toast.error(errorMessage, { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDeleteDialog = (id) => {
    setPositionToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Depuração: Verifique se user e roles estão sendo carregados
  useEffect(() => {
    console.log('User roles:', user?.roles);
  }, [user]);

  return (
    <div className="space-y-6 p-4 sm:p-6 min-w-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Cargos</h1>
          <p className="text-muted-foreground">Gerencie os cargos da empresa</p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[150px]"
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Cargo
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Buscar Cargos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, descrição ou salário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 bg-input text-foreground border-border w-full"
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Lista de Cargos ({positions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Salário</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Nenhum cargo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  positions.map((pos) => (
                    <TableRow key={pos.id}>
                      <TableCell>{pos.name}</TableCell>
                      <TableCell>{pos.description || 'Sem descrição'}</TableCell>
                      <TableCell>{pos.salary ? `R$ ${pos.salary.toFixed(2)}` : 'Não definido'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-accent-foreground hover:text-accent"
                            onClick={() =>
                              setSelectedPosition({
                                ...pos,
                                salary: pos.salary?.toString() || '',
                                status: pos.status || 'Não definido',
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
                            onClick={() => handleOpenDeleteDialog(pos.id)}
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
            <DialogTitle>Criar Novo Cargo</DialogTitle>
            <DialogDescription>Insira os detalhes para um novo cargo</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name-create">Nome</Label>
              <Input
                id="name-create"
                value={newPosition.name}
                onChange={(e) => setNewPosition({ ...newPosition, name: e.target.value })}
                className="mt-1"
                disabled={isLoading}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="salary-create">Salário</Label>
              <Input
                id="salary-create"
                type="number"
                step="0.01"
                value={newPosition.salary}
                onChange={(e) => setNewPosition({ ...newPosition, salary: e.target.value })}
                className="mt-1"
                disabled={isLoading}
              />
              {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description-create">Descrição</Label>
              <Input
                id="description-create"
                value={newPosition.description}
                onChange={(e) => setNewPosition({ ...newPosition, description: e.target.value })}
                className="mt-1"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
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
              onClick={handleCreatePosition}
              disabled={Object.keys(errors).length > 0 || isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedPosition} onOpenChange={() => setSelectedPosition(null)}>
        <DialogContent className="bg-card text-foreground border-border max-w-[90vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Editar Cargo</DialogTitle>
            <DialogDescription>Atualize os detalhes de {selectedPosition?.name}</DialogDescription>
          </DialogHeader>
          {selectedPosition && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name-edit">Nome</Label>
                <Input
                  id="name-edit"
                  value={selectedPosition.name}
                  onChange={(e) => setSelectedPosition({ ...selectedPosition, name: e.target.value })}
                  className="mt-1"
                  disabled={isLoading}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="salary-edit">Salário</Label>
                <Input
                  id="salary-edit"
                  type="number"
                  step="0.01"
                  value={selectedPosition.salary}
                  onChange={(e) => setSelectedPosition({ ...selectedPosition, salary: e.target.value })}
                  className="mt-1"
                  disabled={isLoading}
                />
                {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description-edit">Descrição</Label>
                <Input
                  id="description-edit"
                  value={selectedPosition.description}
                  onChange={(e) => setSelectedPosition({ ...selectedPosition, description: e.target.value })}
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
          <DialogFooter className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedPosition(null);
                setErrors({});
              }}
              className="text-muted-foreground"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdatePosition}
              disabled={Object.keys(errors).length > 0 || isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card text-foreground border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir permanentemente este cargo? Esta ação não pode ser desfeita. Cargo: {' '}
              {positions.find((pos) => pos.id === positionToDelete)?.name || 'Não identificado'}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setPositionToDelete(null);
              }}
              className="text-muted-foreground"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Positions;
