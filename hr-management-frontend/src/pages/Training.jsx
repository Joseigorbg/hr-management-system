import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, Plus, Edit, Trash2, Upload, UserPlus } from 'lucide-react';
import { api } from '../contexts/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// Cores para os gráficos
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042'];

const Training = () => {
  const [trainings, setTrainings] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [dialogs, setDialogs] = useState({
    create: false,
    delete: false,
    progress: false,
    participantProgress: false,
    addParticipant: false,
    document: false,
    log: false,
  });
  const [trainingToDelete, setTrainingToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [newProgress, setNewProgress] = useState(0);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [newParticipant, setNewParticipant] = useState({ userId: '', progress: '', document: null });

  const [newTraining, setNewTraining] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    maxParticipants: '',
    status: 'scheduled',
    progress: '',
    instructorId: '',
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [{ data: userData }, { data: trainingData }] = await Promise.all([
        api.get('/users'),
        api.get('/trainings', { params: { page: 1, limit: 10, search: searchTerm } }),
      ]);
      setUsers(Array.isArray(userData.data) ? userData.data : []);
      setTrainings(Array.isArray(trainingData.data) ? trainingData.data : []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      toast.error('Erro ao carregar dados.', { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchTrainingDetails = async (id) => {
    try {
      const { data } = await api.get(`/trainings/${id}`);
      setSelectedTraining({
        ...data.data,
        startDate: data.data.startDate.split('T')[0],
        endDate: data.data.endDate.split('T')[0],
        maxParticipants: data.data.maxParticipants?.toString() || '',
        progress: data.data.progress?.toString() || '0',
        instructorId: data.data.instructorId || 'none',
        participantCount: data.data.participantCount || 0,
      });
    } catch (err) {
      console.error('Erro ao buscar detalhes:', err);
      toast.error('Erro ao carregar detalhes.', { duration: 3000 });
    }
  };

  const validateTraining = (training) => {
    const newErrors = {};
    if (!training.name?.trim()) newErrors.name = 'Nome é obrigatório';
    if (!training.startDate) newErrors.startDate = 'Data de início é obrigatória';
    if (!training.endDate) newErrors.endDate = 'Data de término é obrigatória';
    if (training.maxParticipants && isNaN(parseInt(training.maxParticipants)))
      newErrors.maxParticipants = 'Número máximo de participantes deve ser válido';
    if (training.progress && (isNaN(parseFloat(training.progress)) || training.progress < 0 || training.progress > 100))
      newErrors.progress = 'Progresso deve ser entre 0 e 100';
    return newErrors;
  };

  const handleTrainingSubmit = async (e, isUpdate = false) => {
    e.preventDefault();
    const training = isUpdate ? selectedTraining : newTraining;
    const validationErrors = validateTraining(training);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Preencha todos os campos corretamente', { duration: 3000 });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      const fields = ['name', 'description', 'startDate', 'endDate', 'maxParticipants', 'status', 'progress'];
      fields.forEach(field => training[field] && formData.append(field, training[field]));
      if (training.instructorId && training.instructorId !== 'none') {
        formData.append('instructorId', training.instructorId);
      }
      if (file) formData.append('document', file);

      const url = isUpdate ? `/trainings/${training.id}` : '/trainings';
      const method = isUpdate ? 'patch' : 'post';
      await api[method](url, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      toast.success(`Treinamento ${isUpdate ? 'atualizado' : 'criado'} com sucesso!`, { duration: 3000 });
      await fetchData();
      setDialogs({ ...dialogs, create: false });
      if (!isUpdate) {
        setNewTraining({ name: '', description: '', startDate: '', endDate: '', maxParticipants: '', status: 'scheduled', progress: '', instructorId: '' });
      } else {
        setSelectedTraining(null);
      }
      setFile(null);
      setErrors({});
    } catch (err) {
      console.error(`Erro ao ${isUpdate ? 'atualizar' : 'criar'} treinamento:`, err);
      toast.error(err.response?.data?.message || `Erro ao ${isUpdate ? 'atualizar' : 'criar'} treinamento`, { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTraining = async () => {
    setIsLoading(true);
    try {
      await api.delete(`/trainings/${trainingToDelete}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success('Treinamento excluído com sucesso!', { duration: 3000 });
      setDialogs({ ...dialogs, delete: false });
      setTrainingToDelete(null);
      await fetchData();
    } catch (err) {
      console.error('Erro ao excluir treinamento:', err);
      toast.error(err.response?.status === 404 ? 'Treinamento não encontrado.' : err.response?.data?.message || 'Erro ao excluir treinamento.', { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgressUpdate = async (isParticipant = false) => {
    setDialogs({ ...dialogs, [isParticipant ? 'participantProgress' : 'progress']: false });
    if (!selectedTraining || (isParticipant && !selectedParticipant)) return;

    try {
      const url = isParticipant
        ? `/trainings/${selectedTraining.id}/participants/${selectedParticipant.user.id}/progress`
        : `/trainings/${selectedTraining.id}/progress`;
      await api.patch(url, { progress: newProgress });
      await fetchTrainingDetails(selectedTraining.id);
      toast.success(`Progresso ${isParticipant ? 'do participante' : 'geral'} atualizado!`, { duration: 3000 });
    } catch (err) {
      console.error(`Erro ao atualizar progresso:`, err);
      toast.error(`Erro ao atualizar progresso`, { duration: 3000 });
    } finally {
      if (isParticipant) setSelectedParticipant(null);
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!selectedTraining || !newParticipant.userId) {
      toast.error('Selecione um participante', { duration: 3000 });
      return;
    }
    if (selectedTraining.participants?.length >= parseInt(selectedTraining.maxParticipants)) {
      toast.error('Limite máximo de participantes atingido', { duration: 3000 });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('userId', newParticipant.userId);
      if (newParticipant.progress) formData.append('progress', newParticipant.progress);
      if (newParticipant.document) formData.append('document', newParticipant.document);

      await api.post(`/trainings/${selectedTraining.id}/participants`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      await fetchTrainingDetails(selectedTraining.id);
      toast.success('Participante adicionado com sucesso!', { duration: 3000 });
      setDialogs({ ...dialogs, addParticipant: false });
      setNewParticipant({ userId: '', progress: '', document: null });
    } catch (err) {
      console.error('Erro ao adicionar participante:', err);
      toast.error(err.response?.data?.message || 'Erro ao adicionar participante', { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadParticipantDocument = async (e) => {
    e.preventDefault();
    if (!selectedParticipant || !file) {
      toast.error('Selecione um arquivo', { duration: 3000 });
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      await api.post(
        `/trainings/${selectedTraining.id}/participants/${selectedParticipant.user.id}/documents`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      await fetchTrainingDetails(selectedTraining.id);
      toast.success('Documento enviado com sucesso!', { duration: 3000 });
      setDialogs({ ...dialogs, document: false });
      setFile(null);
    } catch (err) {
      console.error('Erro ao enviar documento:', err);
      toast.error(err.response?.data?.message || 'Erro ao enviar documento', { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status) => ({
    scheduled: 'Agendado',
    in_progress: 'Em Andamento',
    completed: 'Concluído',
    canceled: 'Cancelado',
  }[status] || 'Desconhecido');

  const getStatusColor = (status) => ({
    Agendado: 'bg-blue-100 text-blue-800',
    'Em Andamento': 'bg-yellow-100 text-yellow-800',
    Concluído: 'bg-green-100 text-green-800',
    Cancelado: 'bg-red-100 text-red-800',
    Desconhecido: 'bg-gray-100 text-gray-800',
  }[getStatusLabel(status)]);

  const TrainingForm = ({ training, setTraining, onSubmit, isUpdate }) => (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {[
          { id: 'name', label: 'Nome do Treinamento', type: 'text', required: true },
          { id: 'description', label: 'Descrição', type: 'text' },
          { id: 'startDate', label: 'Data de Início', type: 'date', required: true },
          { id: 'endDate', label: 'Data de Término', type: 'date', required: true },
          { id: 'maxParticipants', label: 'Número de Participantes', type: 'number' },
        ].map(({ id, label, type, required }) => (
          <div key={id}>
            <Label htmlFor={`${id}-${isUpdate ? 'edit' : 'create'}`}>{label}</Label>
            <Input
              id={`${id}-${isUpdate ? 'edit' : 'create'}`}
              type={type}
              value={training[id] || ''}
              onChange={(e) => setTraining({ ...training, [id]: e.target.value })}
              className="mt-2"
              disabled={isLoading}
              required={required}
            />
            {errors[id] && <p className="text-red-500 text-sm mt-1">{errors[id]}</p>}
          </div>
        ))}
        <div>
          <Label htmlFor={`instructorId-${isUpdate ? 'edit' : 'create'}`}>Instrutor</Label>
          <Select
            value={training.instructorId || 'none'}
            onValueChange={(value) => setTraining({ ...training, instructorId: value })}
            disabled={isLoading}
          >
            <SelectTrigger id={`instructorId-${isUpdate ? 'edit' : 'create'}`} className="mt-2">
              <SelectValue placeholder="Selecione o instrutor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum instrutor</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} {user.surname || ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor={`status-${isUpdate ? 'edit' : 'create'}`}>Status</Label>
          <Select
            value={training.status || 'scheduled'}
            onValueChange={(value) => setTraining({ ...training, status: value })}
            disabled={isLoading}
          >
            <SelectTrigger id={`status-${isUpdate ? 'edit' : 'create'}`} className="mt-2">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              {['scheduled', 'in_progress', 'completed', 'canceled'].map(status => (
                <SelectItem key={status} value={status}>{getStatusLabel(status)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isUpdate && (
          <div>
            <Label>Progresso</Label>
            <div className="relative w-full mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${training.progress || 0}%` }}
                ></div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={training.progress || 0}
                onChange={(e) => setNewProgress(parseInt(e.target.value, 10)) || setDialogs({ ...dialogs, progress: true })}
                className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer absolute top-0 left-0 opacity-0"
              />
              <span className="absolute text-sm text-gray-700 mt-2" style={{ left: `${training.progress || 0}%`, transform: 'translateX(-50%)' }}>
                {training.progress || 0}%
              </span>
            </div>
          </div>
        )}
        <div>
          <Label htmlFor={`document-${isUpdate ? 'edit' : 'create'}`}>Documento</Label>
          <div className="flex items-center mt-2">
            <Input
              id={`document-${isUpdate ? 'edit' : 'create'}`}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById(`document-${isUpdate ? 'edit' : 'create'}`).click()}
              disabled={isLoading}
            >
              <Upload className="mr-2 h-4 w-4" /> {file ? file.name : 'Selecionar Documento'}
            </Button>
          </div>
        </div>
      </div>
      <DialogFooter className="mt-6 flex justify-end gap-4">
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            setDialogs({ ...dialogs, [isUpdate ? 'selectedTraining' : 'create']: false });
            setErrors({});
            setFile(null);
            if (isUpdate) setSelectedTraining(null);
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
          {isUpdate ? 'Salvar Alterações' : 'Criar'}
        </Button>
      </DialogFooter>
    </form>
  );

  // Preparar dados para os gráficos
  const progressData = trainings.map((training) => ({
    name: training.name,
    progress: training.progress || 0,
  }));

  const statusData = [
    { name: 'Agendado', value: trainings.filter(t => t.status === 'scheduled').length, fill: COLORS[0] },
    { name: 'Em Andamento', value: trainings.filter(t => t.status === 'in_progress').length, fill: COLORS[1] },
    { name: 'Concluído', value: trainings.filter(t => t.status === 'completed').length, fill: COLORS[2] },
    { name: 'Cancelado', value: trainings.filter(t => t.status === 'canceled').length, fill: COLORS[3] },
  ].filter(data => data.value > 0);

  const participantsData = trainings.map((training) => ({
    name: training.name,
    participants: training.participantCount || 0,
  }));

  return (
    <div className="container mx-auto p-6 sm:p-8 space-y-10">
      <Card className="bg-card border-border">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-semibold">Status sobre os treinamentos</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Total de Treinamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{trainings.length}</p>
              {trainings.length > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="progress" fill="#8884d8" name="Progresso (%)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Média de Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {trainings.length > 0 ? Math.round(trainings.reduce((sum, t) => sum + (t.progress || 0), 0) / trainings.length) : 0}%
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Treinamentos Concluídos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {trainings.filter(t => t.status === 'completed').length}
              </p>
              {statusData.length > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="value"
                      nameKey="name"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Participantes por Treinamento</CardTitle>
            </CardHeader>
            <CardContent>
              {participantsData.length > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={participantsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="participants" fill="#82ca9d" name="Participantes" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-semibold">Lista de Treinamentos ({trainings.length})</CardTitle>
            <Button
              onClick={() => setDialogs({ ...dialogs, create: true })}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" /> Novo Treinamento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : (
            <div className="space-y-8">
              {trainings.map((training) => (
                <div key={training.id} className="border border-border rounded-lg p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
                    <div>
                      <h3 className="text-2xl font-bold">{training.name}</h3>
                      <p className="text-md text-muted-foreground mt-2">Instrutor: {training.instructor?.name || 'Não definido'}</p>
                      <p className="text-md text-muted-foreground mt-2">Data de Início: {new Date(training.startDate).toLocaleDateString()}</p>
                      <p className="text-md text-muted-foreground mt-2">Número de Participantes: {training.participantCount || 0}</p>
                      <p className="text-md text-muted-foreground mt-2">
                        Status: <Badge className={getStatusColor(training.status)}>{getStatusLabel(training.status)}</Badge>
                      </p>
                    </div>
                    <div className="flex space-x-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-accent-foreground hover:text-accent"
                        onClick={() => fetchTrainingDetails(training.id)}
                        disabled={isLoading}
                      >
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/80"
                        onClick={() => {
                          setTrainingToDelete(training.id);
                          setDialogs({ ...dialogs, delete: true });
                        }}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogs.create} onOpenChange={(open) => setDialogs({ ...dialogs, create: open })}>
        <DialogContent className="bg-card text-foreground border-border max-w-[90vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Treinamento</DialogTitle>
            <DialogDescription>Insira os detalhes para um novo treinamento</DialogDescription>
          </DialogHeader>
          <TrainingForm
            training={newTraining}
            setTraining={setNewTraining}
            onSubmit={handleTrainingSubmit}
            isUpdate={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedTraining} onOpenChange={() => setSelectedTraining(null)}>
        <DialogContent className="bg-card text-foreground border-border max-w-[90vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Treinamento: {selectedTraining?.name}</DialogTitle>
            <DialogDescription>Atualize os detalhes do treinamento</DialogDescription>
          </DialogHeader>
          {selectedTraining && (
            <div className="space-y-6">
              <TrainingForm
                training={selectedTraining}
                setTraining={setSelectedTraining}
                onSubmit={(e) => handleTrainingSubmit(e, true)}
                isUpdate={true}
              />
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Participantes ({selectedTraining.participants?.length || 0}/{selectedTraining.maxParticipants || '∞'})</h3>
                  <Button
                    variant="outline"
                    onClick={() => setDialogs({ ...dialogs, addParticipant: true })}
                    disabled={isLoading}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <UserPlus className="mr-2 h-4 w-4" /> Adicionar Participante
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Progresso</TableHead>
                      <TableHead>Documentos</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTraining.participants?.length ? (
                      selectedTraining.participants.map((p) => (
                        <TableRow key={p.user.id}>
                          <TableCell>{p.user.name} {p.user.surname || ''}</TableCell>
                          <TableCell>
                            <div className="relative w-full">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                  style={{ width: `${p.progress || 0}%` }}
                                ></div>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={p.progress || 0}
                                onChange={(e) => {
                                  setSelectedParticipant(p);
                                  setNewProgress(parseInt(e.target.value, 10));
                                  setDialogs({ ...dialogs, participantProgress: true });
                                }}
                                className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer absolute top-0 left-0 opacity-0"
                              />
                              <span className="absolute text-sm text-gray-700 mt-2" style={{ left: `${p.progress || 0}%`, transform: 'translateX(-50%)' }}>
                                {p.progress || 0}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {p.documents?.map((doc) => (
                              <span key={doc.id} className="mr-2">{doc.fileName}</span>
                            )) || 'Nenhum documento'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedParticipant(p);
                                setFile(null);
                                setDialogs({ ...dialogs, document: true });
                              }}
                              disabled={isLoading}
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Nenhum participante encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div>
                <Button
                  variant="outline"
                  onClick={() => setDialogs({ ...dialogs, log: !dialogs.log })}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {dialogs.log ? 'Ocultar Log de Tarefas' : 'Mostrar Log de Tarefas'}
                </Button>
                {dialogs.log && (
                  <div className="mt-6 p-4 bg-card border border-border rounded text-sm text-muted-foreground">
                    <p>Total: {selectedTraining.taskCount || 0}, Completas: {selectedTraining.completedTasks || 0}</p>
                    {selectedTraining.tasks?.map((task) => (
                      <div key={task.id} className="mt-2">
                        <p>{task.title} - {task.isActive ? 'Ativa' : 'Concluída'}</p>
                        <p className="text-xs">{new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}</p>
                      </div>
                    )) || <p>Nenhuma tarefa encontrada</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogs.addParticipant} onOpenChange={(open) => setDialogs({ ...dialogs, addParticipant: open })}>
        <DialogContent className="bg-card text-foreground border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Participante</DialogTitle>
            <DialogDescription>Selecione um participante para adicionar ao treinamento</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddParticipant}>
            <div className="space-y-6">
              <div>
                <Label htmlFor="userId-add">Participante</Label>
                <Select
                  value={newParticipant.userId}
                  onValueChange={(value) => setNewParticipant({ ...newParticipant, userId: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger id="userId-add" className="mt-2">
                    <SelectValue placeholder="Selecione o participante" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter((user) => !selectedTraining?.participants?.some((p) => p.user.id === user.id))
                      .map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} {user.surname || ''}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="progress-add">Progresso Inicial (%)</Label>
                <Input
                  id="progress-add"
                  type="number"
                  min="0"
                  max="100"
                  value={newParticipant.progress}
                  onChange={(e) => setNewParticipant({ ...newParticipant, progress: e.target.value })}
                  className="mt-2"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="document-add">Documento</Label>
                <div className="flex items-center mt-2">
                  <Input
                    id="document-add"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setNewParticipant({ ...newParticipant, document: e.target.files[0] })}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('document-add').click()}
                    disabled={isLoading}
                  >
                    <Upload className="mr-2 h-4 w-4" /> {newParticipant.document ? newParticipant.document.name : 'Selecionar Documento'}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6 flex justify-end gap-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setDialogs({ ...dialogs, addParticipant: false })}
                className="text-muted-foreground"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !newParticipant.userId}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Adicionar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogs.delete} onOpenChange={(open) => setDialogs({ ...dialogs, delete: open })}>
        <DialogContent className="bg-card text-foreground border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir este treinamento? Esta ação não pode ser desfeita. Treinamento: {' '}
              {trainings.find((t) => t.id === trainingToDelete)?.name || 'Não identificado'}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setDialogs({ ...dialogs, delete: false });
                setTrainingToDelete(null);
              }}
              className="text-muted-foreground"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTraining}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogs.progress} onOpenChange={(open) => setDialogs({ ...dialogs, progress: open })}>
        <DialogContent className="bg-card text-foreground border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Progresso</DialogTitle>
            <DialogDescription>Deseja definir o progresso para {newProgress}%?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => setDialogs({ ...dialogs, progress: false })}
              className="text-muted-foreground"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleProgressUpdate()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogs.participantProgress} onOpenChange={(open) => setDialogs({ ...dialogs, participantProgress: open })}>
        <DialogContent className="bg-card text-foreground border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Progresso do Participante</DialogTitle>
            <DialogDescription>Deseja definir o progresso para {newProgress}%?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => setDialogs({ ...dialogs, participantProgress: false })}
              className="text-muted-foreground"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleProgressUpdate(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogs.document} onOpenChange={(open) => setDialogs({ ...dialogs, document: open })}>
        <DialogContent className="bg-card text-foreground border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Documento para Participante</DialogTitle>
            <DialogDescription>
              Envie um documento para {selectedParticipant?.user.name} {selectedParticipant?.user.surname || ''}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUploadParticipantDocument}>
            <div className="space-y-6">
              <div>
                <Label htmlFor="participant-document">Documento</Label>
                <div className="flex items-center mt-2">
                  <Input
                    id="participant-document"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('participant-document').click()}
                    disabled={isLoading}
                  >
                    <Upload className="mr-2 h-4 w-4" /> {file ? file.name : 'Selecionar Documento'}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6 flex justify-end gap-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setDialogs({ ...dialogs, document: false })}
                className="text-muted-foreground"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !file}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Enviar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Training;