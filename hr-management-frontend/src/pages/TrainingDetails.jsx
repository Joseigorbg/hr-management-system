import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import trainingService from '../services/trainingService';
import { Eye, Trash2 } from 'lucide-react';

const TrainingDetails = () => {
  const { trainingId } = useParams();
  const navigate = useNavigate();
  const [training, setTraining] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [stats, setStats] = useState({ trainings: {}, enrollments: {} });
  const [isLoading, setIsLoading] = useState(false);

  const fetchTrainingDetails = useCallback(async () => {
    if (!trainingId) {
      console.error('No trainingId provided');
      toast.error('ID do treinamento não fornecido.');
      navigate('/trainings');
      return;
    }

    setIsLoading(true);
    try {
      const [trainingRes, participantsRes, statsRes] = await Promise.all([
        trainingService.getTraining(trainingId),
        trainingService.getParticipants(trainingId),
        trainingService.getStats(),
      ]);

      console.log('Training response:', trainingRes);
      console.log('Participants response:', participantsRes);
      console.log('Stats response:', statsRes);

      // Set training data
      setTraining(trainingRes);

      // Format participants data
      const formattedParticipants = Array.isArray(participantsRes.data)
        ? participantsRes.data.map(p => ({
            ...p,
            users: p.users || p.user || {},
            documents: p.documents || p.documentList || [],
          }))
        : [];
      setParticipants(formattedParticipants);

      // Set stats
      setStats(statsRes || { trainings: {}, enrollments: {} });
    } catch (err) {
      console.error('Erro ao carregar detalhes do treinamento:', err);
      toast.error(
        err.response?.status === 404
          ? 'Treinamento não encontrado.'
          : err.message.includes('database')
          ? 'Erro de conexão com o banco de dados.'
          : err.message || 'Erro ao carregar dados.'
      );
      navigate('/trainings');
    } finally {
      setIsLoading(false);
    }
  }, [trainingId, navigate]);

  useEffect(() => {
    fetchTrainingDetails();
  }, [fetchTrainingDetails]);

  useEffect(() => {
    console.log('Current state:', { training, participants, stats });
  }, [training, participants, stats]);

  const getStatusLabel = (status) => {
    const statuses = {
      mandatory: 'Obrigatório',
      development: 'Desenvolvimento',
      scheduled: 'Agendado',
      ongoing: 'Em Andamento',
      completed: 'Concluído',
    };
    return statuses[status] || 'Desconhecido';
  };

  const getStatusColor = (status) => {
    const colors = {
      mandatory: 'bg-red-100 text-red-800',
      development: 'bg-blue-100 text-blue-800',
      scheduled: 'bg-yellow-100 text-yellow-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleDeleteDocument = async (userTrainingId, documentId) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return;
    setIsLoading(true);
    try {
      await trainingService.deleteDocument(documentId);
      toast.success('Documento excluído!');
      fetchTrainingDetails(); // Refresh participants
    } catch (err) {
      console.error('Erro ao excluir documento:', err);
      toast.error(err.message || 'Erro ao excluir documento.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!training) {
    return <p className="text-center text-muted-foreground">Nenhum dado disponível.</p>;
  }

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6">
      <Button variant="outline" onClick={() => navigate('/trainings')}>
        Voltar para Treinamentos
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{training.name}</CardTitle>
          <Badge className={getStatusColor(training.status)}>
            {getStatusLabel(training.status)}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p><strong>Descrição:</strong> {training.description || 'N/A'}</p>
            <p><strong>Instrutor:</strong> {training.instructor?.name} {training.instructor?.surname || ''}</p>
            <p><strong>Data de Início:</strong> {new Date(training.startDate).toLocaleDateString()}</p>
            <p><strong>Data de Fim:</strong> {new Date(training.endDate).toLocaleDateString()}</p>
            <p><strong>Participantes:</strong> {training._count?.training_participations || 0} / {training.maxParticipants || 'Sem limite'}</p>
            <p><strong>Progresso:</strong> {training.progress || 0}%</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Participantes</CardTitle>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhum participante inscrito.</p>
          ) : (
            participants.map(p => (
              <div key={p.id} className="border-b py-2">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback className="text-sm bg-muted">
                      {p.users.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'ND'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{p.users.name} {p.users.surname || ''}</p>
                    <p className="text-sm text-muted-foreground">{p.users.email || 'N/A'}</p>
                  </div>
                </div>
                <p className="text-sm mt-2"><strong>Departamento:</strong> {p.users.department?.name || 'N/A'}</p>
                <p className="text-sm"><strong>Cargo:</strong> {p.users.position?.name || 'N/A'}</p>
                <p className="text-sm"><strong>Status:</strong> {p.status || 'N/A'}</p>
                <p className="text-sm mt-2"><strong>Documentos:</strong></p>
                {p.documents?.length ? (
                  <ul className="space-y-1 mt-1">
                    {p.documents.map(doc => (
                      <li key={doc.id} className="flex items-center justify-between">
                        <span>{doc.fileName} ({(doc.fileSize / 1024).toFixed(2)} KB)</span>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(`/api/training/documents/${doc.id}`, '_blank')}
                            disabled={isLoading}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteDocument(p.id, doc.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum documento registrado</p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Treinamentos Ativos</p>
                <p className="text-2xl font-bold">{stats.trainings.total || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Participantes</p>
                <p className="text-2xl font-bold">{stats.enrollments.total || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-2xl font-bold">{(stats.enrollments.completionRate || 0).toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">{stats.enrollments.completed || 0}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingDetails;