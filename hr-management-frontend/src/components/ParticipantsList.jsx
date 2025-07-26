// src/components/ParticipantsList.jsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Upload, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import trainingService from '../services/trainingService';

const ParticipantsList = ({ participants, isLoading, setDialogs, setData, handleDeleteDocument, fetchParticipants, selectedTrainingId }) => {
  const handleUploadDocuments = async (e, userTrainingId, files) => {
    e.preventDefault();
    if (!userTrainingId) {
      return toast.error('Selecione uma participação.');
    }
    if (!files.length) {
      return toast.error('Selecione pelo menos um arquivo.');
    }
    try {
      await trainingService.uploadDocuments(userTrainingId, files);
      toast.success('Documentos enviados!');
      setDialogs(d => ({ ...d, upload: false }));
      setData(d => ({ ...d, uploadDocument: { userTrainingId: '', files: [] } }));
      if (selectedTrainingId) fetchParticipants(selectedTrainingId);
    } catch (err) {
      console.error('Erro ao enviar documentos:', err);
      toast.error(
        err.response?.status === 404
          ? 'Inscrição não encontrada.'
          : err.response?.status === 400
          ? 'Dados inválidos para upload.'
          : err.message || 'Erro ao enviar documentos.'
      );
    }
  };

  return (
    <>
      {participants.map(p => (
        <div key={p.id} className="border-b py-2">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarFallback className="text-sm bg-muted">
                {p.users?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'ND'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{p.users?.name} {p.users?.surname || ''}</p>
              <p className="text-sm text-muted-foreground">{p.users?.email || 'N/A'}</p>
            </div>
          </div>
          <p className="text-sm mt-2"><strong>Departamento:</strong> {p.users?.department?.name || 'N/A'}</p>
          <p className="text-sm"><strong>Cargo:</strong> {p.users?.position?.name || 'N/A'}</p>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setData(d => ({ ...d, uploadDocument: { userTrainingId: p.id, files: [] } }));
              setDialogs(d => ({ ...d, upload: true }));
            }}
            disabled={isLoading}
            className="mt-2"
          >
            <Upload className="mr-2 h-4 w-4" /> Upload Documentos
          </Button>
        </div>
      ))}

      <Dialog open={dialogs.upload} onOpenChange={() => setDialogs(d => ({ ...d, upload: false }))}>
        <DialogContent className="bg-card text-foreground border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Upload de Documentos</DialogTitle>
            <DialogDescription>Faça o upload de documentos para uma participação</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => handleUploadDocuments(e, data.uploadDocument.userTrainingId, data.uploadDocument.files)}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="userTrainingId">Participação</Label>
                <Select
                  value={data.uploadDocument.userTrainingId}
                  onValueChange={value => setData(d => ({ ...d, uploadDocument: { ...d.uploadDocument, userTrainingId: value } }))}
                  disabled={isLoading}
                >
                  <SelectTrigger id="userTrainingId" className="mt-1">
                    <SelectValue placeholder="Selecione a participação" />
                  </SelectTrigger>
                  <SelectContent>
                    {participants.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.users?.name} {p.users?.surname || ''} ({p.users?.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="files">Arquivos</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="files"
                    type="file"
                    multiple
                    onChange={e => setData(d => ({ ...d, uploadDocument: { ...d.uploadDocument, files: Array.from(e.target.files) } }))}
                    disabled={isLoading}
                  />
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                {data.uploadDocument.files.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {data.uploadDocument.files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => setData(d => ({ ...d, uploadDocument: { ...d.uploadDocument, files: d.uploadDocument.files.filter((_, i) => i !== index) } }))}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <DialogFooter className="mt-4 flex justify-end gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setDialogs(d => ({ ...d, upload: false }))}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>Enviar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ParticipantsList;