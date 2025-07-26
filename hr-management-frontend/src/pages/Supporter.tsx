import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, Plus, Trash2, Edit2 } from 'lucide-react';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import supporterService from '@/services/supporterService';

const Apoiadores = () => {
  const { user, loading: authLoading, isAuthenticated } = useContext(AuthContext);
  const [apoiadores, setApoiadores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogState, setDialogState] = useState({ type: '', open: false, data: null, suggestions: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const mapRef = useRef(null);
  const createMapRef = useRef(null);
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const isEmployee = user?.role === 'employee';
  const canCreate = isAdmin;
  const canEdit = isAdmin;
  const canDelete = isAdmin;

  const fetchApoiadores = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;
    setIsLoading(true);
    try {
      const params = { page: currentPage, limit: 10, search: searchTerm, status: isEmployee ? 'active' : statusFilter || undefined };
      const { data, totalPages } = await supporterService.fetchSupporters(params);
      setApoiadores(data);
      setTotalPages(totalPages);
      if (!data.length) {
        toast.info(isEmployee ? 'Nenhum apoiador ativo encontrado.' : 'Nenhum apoiador encontrado.', { duration: 3000 });
      }
    } catch (error) {
      toast.error(error.message || 'Erro ao carregar apoiadores', { duration: 3000 });
      setApoiadores([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, isAuthenticated, authLoading, isEmployee]);

  const debouncedFetchApoiadores = useCallback(debounce(fetchApoiadores, 300), [fetchApoiadores]);

  useEffect(() => {
    debouncedFetchApoiadores();
    return () => debouncedFetchApoiadores.cancel();
  }, [debouncedFetchApoiadores]);

  useEffect(() => {
    if (mapRef.current && !dialogState.open) {
      supporterService.initializeMap(mapRef, apoiadores);
    }
    return () => {
      supporterService.cleanupMap(mapRef);
    };
  }, [apoiadores, dialogState.open]);

  useEffect(() => {
    if (dialogState.type === 'create' && dialogState.open && createMapRef.current) {
      setTimeout(() => {
        supporterService.initializeMap(createMapRef, [], [0.0349, -51.0694], (coords) => {
          setDialogState((prev) => ({ ...prev, data: { ...prev.data, ...coords } }));
        });
      }, 100);
    }
    return () => {
      supporterService.cleanupMap(createMapRef);
    };
  }, [dialogState.type, dialogState.open]);

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setDialogState((prev) => ({ ...prev, data: { ...prev.data, address: value } }));
    const suggestions = value ? supporterService.getAddressSuggestions(value) : [];
    setDialogState((prev) => ({ ...prev, suggestions }));
  };

  const handleCreateApoiador = async () => {
    const error = supporterService.validateSupporter(dialogState.data);
    if (error) {
      toast.error(error, { duration: 3000 });
      return;
    }
    try {
      setIsLoading(true);
      await supporterService.createSupporter(dialogState.data);
      toast.success('Apoiador criado com sucesso', { duration: 3000 });
      setDialogState({ type: '', open: false, data: null, suggestions: [] });
      await fetchApoiadores();
    } catch (error) {
      toast.error(error.message || 'Erro ao criar apoiador', { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteApoiador = async () => {
    try {
      setIsLoading(true);
      await supporterService.deleteSupporter(dialogState.data);
      toast.success('Apoiador excluído com sucesso', { duration: 3000 });
      setDialogState({ type: '', open: false, data: null, suggestions: [] });
      await fetchApoiadores();
    } catch (error) {
      toast.error(error.message || 'Erro ao excluir apoiador', { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  if (authLoading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" /></div>;
  if (!isAuthenticated) return <div className="flex justify-center items-center h-screen"><p className="text-muted-foreground">Faça login para acessar a lista de apoiadores.</p></div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Apoiadores</h1>
          <p className="text-muted-foreground">{isEmployee ? 'Visualize os apoiadores ativos.' : 'Gerencie os apoiadores externos.'}</p>
        </div>
        {canCreate && (
          <Dialog open={dialogState.type === 'create' && dialogState.open} onOpenChange={(open) => setDialogState({
            type: open ? 'create' : '', open, data: open ? { name: '', phone: '', address: '', cep: '', mapping: '', supportType: '', status: 'active', lat: null, lng: null } : null, suggestions: []
          })}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Novo Apoiador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] sm:max-w-[80vw] md:max-w-[60vw] max-h-[90vh] overflow-y-auto bg-card text-foreground border-border">
              <DialogHeader>
                <DialogTitle>Criar Novo Apoiador</DialogTitle>
                <DialogDescription>Insira os detalhes e selecione a localização no mapa</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                <div>
                  <div className="mb-4">
                    <Label htmlFor="name">Nome <span className="text-red-500">*</span></Label>
                    <Input id="name" value={dialogState.data?.name || ''} onChange={(e) => setDialogState((prev) => ({ ...prev, data: { ...prev.data, name: e.target.value } }))} placeholder="Digite o nome" className="mt-1 bg-input text-foreground border-border" />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="phone">Telefone <span className="text-red-500">*</span></Label>
                    <Input id="phone" value={dialogState.data?.phone || ''} onChange={(e) => setDialogState((prev) => ({ ...prev, data: { ...prev.data, phone: e.target.value } }))} placeholder="Ex: (96) 99999-9999" className="mt-1 bg-input text-foreground border-border" />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="address">Endereço <span className="text-red-500">*</span></Label>
                    <Input id="address" value={dialogState.data?.address || ''} onChange={handleAddressChange} placeholder="Digite o endereço" className="mt-1 bg-input text-foreground border-border" />
                    {dialogState.suggestions.length > 0 && (
                      <ul className="mt-1 bg-card border-border rounded-md shadow-lg max-h-40 overflow-auto">
                        {dialogState.suggestions.map((suggestion, index) => (
                          <li key={index} className="px-4 py-2 hover:bg-muted cursor-pointer" onClick={() => setDialogState((prev) => ({ ...prev, data: { ...prev.data, address: suggestion }, suggestions: [] }))}>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <Label htmlFor="cep">CEP <span className="text-red-500">*</span></Label>
                    <Input id="cep" value={dialogState.data?.cep || ''} onChange={(e) => setDialogState((prev) => ({ ...prev, data: { ...prev.data, cep: e.target.value } }))} placeholder="Ex: 68900-000" className="mt-1 bg-input text-foreground border-border" />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="mapping">Mapeamento <span className="text-red-500">*</span></Label>
                    <Input id="mapping" value={dialogState.data?.mapping || ''} onChange={(e) => setDialogState((prev) => ({ ...prev, data: { ...prev.data, mapping: e.target.value } }))} placeholder="Ex: Zona Norte, Rural" className="mt-1 bg-input text-foreground border-border" />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="supportType">Tipo de Suporte <span className="text-red-500">*</span></Label>
                    <Select value={dialogState.data?.supportType || ''} onValueChange={(value) => setDialogState((prev) => ({ ...prev, data: { ...prev.data, supportType: value } }))}>
                      <SelectTrigger id="supportType" className="mt-1 bg-input text-foreground border-border">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-card text-foreground border-border">
                        <SelectItem value="people">Suporte de Pessoas</SelectItem>
                        <SelectItem value="funding">Financiamento</SelectItem>
                        <SelectItem value="documents">Documentos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="status">Status</Label>
                    <Select value={dialogState.data?.status || 'active'} onValueChange={(value) => setDialogState((prev) => ({ ...prev, data: { ...prev.data, status: value } }))}>
                      <SelectTrigger id="status" className="mt-1 bg-input text-foreground border-border">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-card text-foreground border-border">
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="terminated">Terminado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Label>Selecionar Localização <span className="text-red-500">*</span></Label>
                <div ref={createMapRef} style={{ height: '350px', width: '100%' }} className="mt-1 rounded-md border border-border" />
              </div>
              <DialogFooter className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogState({ type: '', open: false, data: null, suggestions: [] })} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateApoiador} disabled={isLoading}>
                  {isLoading ? 'Criando...' : 'Criar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isEmployee && !isLoading && !apoiadores.length && (
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Não há apoiadores ativos disponíveis no momento.</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Busca de Apoiadores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou telefone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 bg-input text-foreground border-border" />
            </div>
            {isAdmin && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-input text-foreground border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-card text-foreground border-border">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="terminated">Terminado</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Lista de Apoiadores ({apoiadores.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center">Carregando...</div>
          ) : (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>CEP</TableHead>
                    <TableHead>Mapeamento</TableHead>
                    <TableHead>Tipo de Suporte</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead>Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apoiadores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 8 : 7} className="text-center">
                        {isEmployee ? 'Nenhum apoiador ativo encontrado.' : 'Nenhum apoiador encontrado.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    apoiadores.map((apoiador) => (
                      <TableRow key={apoiador.id}>
                        <TableCell>{apoiador.name}</TableCell>
                        <TableCell>{apoiador.phone}</TableCell>
                        <TableCell>{apoiador.address}</TableCell>
                        <TableCell>{apoiador.cep}</TableCell>
                        <TableCell>{apoiador.mapping}</TableCell>
                        <TableCell>
                          {apoiador.supportType === 'people' ? 'Suporte de Pessoas' : apoiador.supportType === 'funding' ? 'Financiamento' : 'Documentos'}
                        </TableCell>
                        <TableCell>
                          <Badge className={supporterService.getStatusColor(apoiador.status)}>
                            {apoiador.status === 'active' ? 'Ativo' : apoiador.status === 'inactive' ? 'Inativo' : 'Terminado'}
                          </Badge>
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => navigate(`/edit-apoiador/${apoiador.id}`)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setDialogState({ type: 'delete', open: true, data: apoiador.id, suggestions: [] })}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="flex justify-center mt-4 space-x-2">
                <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} variant="outline">
                  Anterior
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button key={page} onClick={() => handlePageChange(page)} variant={currentPage === page ? 'default' : 'outline'} className={currentPage === page ? 'bg-primary text-primary-foreground' : ''}>
                    {page}
                  </Button>
                ))}
                <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} variant="outline">
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Mapa de Apoiadores</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={mapRef} style={{ height: '350px', width: '100%' }} className="rounded-lg border border-border" />
        </CardContent>
      </Card>

      <Dialog open={dialogState.type === 'delete' && dialogState.open} onOpenChange={(open) => setDialogState({ type: open ? 'delete' : '', open, data: open ? dialogState.data : null, suggestions: [] })}>
        <DialogContent className="max-w-[80vw] sm:max-w-[50vw] md:max-w-[40vw] bg-card text-foreground border-border">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja excluir o apoiador {apoiadores.find((a) => a.id === dialogState.data)?.name || 'Não identificado'}? Esta ação é irreversível.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogState({ type: '', open: false, data: null, suggestions: [] })} disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteApoiador} disabled={isLoading}>
              {isLoading ? 'Excluindo...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Apoiadores;