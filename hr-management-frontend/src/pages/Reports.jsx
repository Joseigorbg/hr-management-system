import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Edit, Trash2, Plus, Search, Download, Eye, Upload, FileText } from 'lucide-react';
import { debounce } from 'lodash';
import reportService from '@/services/reportService';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogState, setDialogState] = useState({ type: '', open: false, data: null });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const userId = localStorage.getItem('userId') || 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6';

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm({
    defaultValues: { name: '', type: '', frequency: '', scheduledDate: '' },
    mode: 'onChange',
    resolver: async (data) => {
      const errors = {};
      if (!data.name?.trim()) errors.name = { message: 'Nome é obrigatório' };
      if (!data.type?.trim()) errors.type = { message: 'Tipo é obrigatório' };
      if (!data.frequency?.trim()) errors.frequency = { message: 'Frequência é obrigatória' };
      return { values: data, errors };
    },
  });

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await reportService.fetchReports(1, 10, searchTerm);
      setReports(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error(err.message || 'Erro ao carregar relatórios', { duration: 3000 });
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  const debouncedFetchReports = useCallback(debounce(fetchReports, 300), [fetchReports]);

  useEffect(() => {
    debouncedFetchReports();
    return () => debouncedFetchReports.cancel();
  }, [debouncedFetchReports]);

  useEffect(() => {
    if (dialogState.type === 'edit' && dialogState.data) {
      setValue('name', dialogState.data.name || '');
      setValue('type', dialogState.data.type || '');
      setValue('frequency', dialogState.data.frequency || '');
      setValue('scheduledDate', dialogState.data.scheduledDate ? new Date(dialogState.data.scheduledDate).toISOString().split('T')[0] : '');
    } else {
      reset();
    }
  }, [dialogState, setValue, reset]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const { validFiles, error } = await reportService.validateFiles(files);
    if (error) {
      toast.error(error, { duration: 3000 });
      return;
    }
    setSelectedFiles(validFiles);
  };

  const onSubmit = async (data) => {
    if (Object.keys(errors).length > 0) {
      toast.error('Preencha todos os campos obrigatórios', { duration: 3000 });
      return;
    }
    try {
      setIsLoading(true);
      const report = dialogState.type === 'edit'
        ? await reportService.updateReport(dialogState.data.id, data)
        : await reportService.createReport(data);
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach(file => formData.append('files', file));
        formData.append('reportId', report.id);
        formData.append('userId', userId);
        await reportService.uploadDocument(formData);
      }
      toast.success(`Relatório ${dialogState.type === 'edit' ? 'atualizado' : 'criado'} com sucesso!`, { duration: 3000 });
      setDialogState({ type: '', open: false, data: null });
      setSelectedFiles([]);
      reset();
      await fetchReports();
    } catch (err) {
      toast.error(err.message || `Erro ao ${dialogState.type === 'edit' ? 'atualizar' : 'criar'} relatório`, { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await reportService.deleteReport(dialogState.data);
      toast.success('Relatório excluído com sucesso!', { duration: 3000 });
      setDialogState({ type: '', open: false, data: null });
      await fetchReports();
    } catch (err) {
      toast.error(err.message || 'Erro ao excluir relatório', { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = async (documentId) => {
    try {
      setIsLoading(true);
      const { url } = await reportService.downloadDocument(documentId);
      setDialogState({ type: 'view', open: true, data: { url } });
    } catch (err) {
      toast.error(err.message || 'Erro ao visualizar documento', { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewReport = async (report) => {
    try {
      const url = report.documents?.[0]?.id ? (await reportService.downloadDocument(report.documents[0].id)).url : null;
      setDialogState({ type: 'preview', open: true, data: { report, url } });
    } catch (err) {
      toast.error('Erro ao carregar prévia do documento', { duration: 3000 });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Gerencie os relatórios da empresa</p>
        </div>
        <Dialog open={dialogState.type === 'edit' || dialogState.type === 'create'} onOpenChange={(open) => setDialogState({ type: open ? 'create' : '', open, data: null })}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Novo Relatório
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl bg-card text-foreground border-border">
            <DialogHeader>
              <DialogTitle>{dialogState.type === 'edit' ? 'Editar Relatório' : 'Novo Relatório'}</DialogTitle>
              <DialogDescription>{dialogState.type === 'edit' ? `Edite as informações do relatório ${dialogState.data?.name}` : 'Crie um novo relatório'}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <Input {...register('name')} placeholder="Nome do relatório" className="w-full bg-input text-foreground border-border" />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <Input {...register('type')} placeholder="Tipo (ex.: employees)" className="w-full bg-input text-foreground border-border" />
                  {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Frequência</label>
                  <Input {...register('frequency')} placeholder="Frequência (ex.: Diária, Mensal)" className="w-full bg-input text-foreground border-border" />
                  {errors.frequency && <p className="text-sm text-destructive">{errors.frequency.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data agendada</label>
                  <Input {...register('scheduledDate')} type="date" className="w-full bg-input text-foreground border-border" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Arquivos (opcional)</label>
                  <Input type="file" multiple accept=".pdf,.docx,.xlsx,.doc,.xls,.txt,.jpg,.png" onChange={handleFileChange} className="w-full bg-input text-foreground border-border" />
                  <p className="text-sm text-muted-foreground">Aceita: PDF, DOCX, XLSX, DOC, XLS, TXT, JPG, PNG</p>
                  {selectedFiles.length > 0 && (
                    <ul className="text-sm text-muted-foreground">
                      {selectedFiles.map((file, index) => (
                        <li key={index}>{file.name} ({file.type}, {file.size} bytes)</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogState({ type: '', open: false, data: null })} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Salvando...' : (dialogState.type === 'edit' ? 'Salvar' : 'Criar')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Buscar RLT</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou tipo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 bg-input text-foreground border-border" />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="text-center col-span-full">Carregando...</div>
        ) : reports.length === 0 ? (
          <div className="text-center col-span-full">Nenhum relatório encontrado</div>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className="bg-card border-border">
              <CardContent className="p-4">
                <CardTitle className="text-lg font-semibold">{report.name}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  <p><strong>Tipo:</strong> {report.type}</p>
                  <p><strong>Frequência:</strong> {report.frequency || 'Não definida'}</p>
                  <p><strong>Agendado:</strong> {report.scheduledDate ? new Date(report.scheduledDate).toLocaleDateString() : 'Não agendado'}</p>
                </div>
                {report.documents?.length > 0 ? (
                  <div className="text-sm text-muted-foreground mt-2">
                    <p><strong>Documentos:</strong></p>
                    {report.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between mt-1">
                        <span>{doc.fileName || 'Documento sem nome'}</span>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => reportService.downloadDocument(doc.id, true)} title="Baixar">
                            <Download className="h-4 w-4" />
                          </Button>
                          {doc.fileType === 'application/pdf' && (
                            <Button variant="ghost" size="icon" onClick={() => handleView(doc.id)} title="Visualizar">
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">Nenhum documento associado</p>
                )}
                <div className="flex justify-between mt-2">
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => setDialogState({ type: 'edit', open: true, data: report })} title="Editar">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDialogState({ type: 'delete', open: true, data: report.id })} title="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Dialog open={dialogState.type === 'upload' && dialogState.data?.id === report.id} onOpenChange={(open) => setDialogState({ type: open ? 'upload' : '', open, data: report })}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Upload">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-card text-foreground border-border">
                        <DialogHeader>
                          <DialogTitle>Incluir Documentos</DialogTitle>
                          <DialogDescription>Upload para {report.name}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input type="file" multiple accept=".pdf,.docx,.xlsx,.doc,.xls,.txt,.jpg,.png" onChange={handleFileChange} className="bg-input text-foreground border-border" />
                          <p className="text-sm text-muted-foreground">Aceita: PDF, DOCX, XLSX, DOC, XLS, TXT, JPG, PNG</p>
                          {selectedFiles.length > 0 && (
                            <ul className="text-sm text-muted-foreground">
                              {selectedFiles.map((file, index) => (
                                <li key={index}>{file.name} ({file.type}, {file.size} bytes)</li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setDialogState({ type: '', open: false, data: null })} disabled={isLoading}>
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            disabled={isLoading || selectedFiles.length === 0}
                            onClick={async () => {
                              try {
                                setIsLoading(true);
                                const formData = new FormData();
                                selectedFiles.forEach(file => formData.append('files', file));
                                formData.append('reportId', report.id);
                                formData.append('userId', userId);
                                await reportService.uploadDocument(formData);
                                toast.success('Documentos enviados com sucesso!', { duration: 3000 });
                                setDialogState({ type: '', open: false, data: null });
                                setSelectedFiles([]);
                                await fetchReports();
                              } catch (err) {
                                toast.error(err.message || 'Erro ao fazer upload', { duration: 3000 });
                              } finally {
                                setIsLoading(false);
                              }
                            }}
                          >
                            {isLoading ? 'Enviando...' : 'Enviar'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="icon" onClick={() => handlePreviewReport(report)} title="Pré-visualizar">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogState.type === 'view' && dialogState.open} onOpenChange={(open) => setDialogState({ type: open ? 'view' : '', open, data: open ? dialogState.data : null })}>
        <DialogContent className="max-w-4xl bg-card text-foreground border-border">
          <DialogHeader>
            <DialogTitle>Visualizar Documento</DialogTitle>
            <DialogDescription>Visualize o documento selecionado</DialogDescription>
          </DialogHeader>
          {dialogState.data?.url ? (
            <div className="mt-4">
              <iframe src={dialogState.data.url} title="Document Preview" className="w-full h-[600px] border border-border rounded-md" />
            </div>
          ) : (
            <p>Carregando...</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogState({ type: '', open: false, data: null })}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogState.type === 'preview' && dialogState.open} onOpenChange={(open) => setDialogState({ type: open ? 'preview' : '', open, data: open ? dialogState.data : null })}>
        <DialogContent className="max-w-4xl bg-card text-foreground border-border">
          <DialogHeader>
            <DialogTitle>Pré-visualização do Relatório</DialogTitle>
            <DialogDescription>Detalhes do relatório {dialogState.data?.report?.name}</DialogDescription>
          </DialogHeader>
          {dialogState.data?.report && (
            <div className="mt-4 space-y-4">
              <div className="text-sm text-foreground">
                <p><strong>Nome:</strong> {dialogState.data.report.name}</p>
                <p><strong>Tipo:</strong> {dialogState.data.report.type}</p>
                <p><strong>Frequência:</strong> {dialogState.data.report.frequency || 'Não definida'}</p>
                <p><strong>Data Agendada:</strong> {dialogState.data.report.scheduledDate ? new Date(dialogState.data.report.scheduledDate).toLocaleDateString() : 'Não agendada'}</p>
                <p><strong>Gerado por:</strong> {dialogState.data.report.users?.name || 'Usuário desconhecido'}</p>
                <p><strong>Data de Criação:</strong> {new Date(dialogState.data.report.created_at).toLocaleDateString()}</p>
              </div>
              {dialogState.data.url ? (
                <div>
                  <h3 className="text-lg font-semibold">Prévia do Documento</h3>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">{dialogState.data.report.documents?.[0]?.fileName || 'Documento sem nome'}</p>
                    <iframe src={dialogState.data.url} title="Document Preview" className="w-full h-[600px] border border-border rounded-md" />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum documento disponível</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogState({ type: '', open: false, data: null })}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogState.type === 'delete' && dialogState.open} onOpenChange={(open) => setDialogState({ type: open ? 'delete' : '', open, data: open ? dialogState.data : null })}>
        <DialogContent className="max-w-md bg-card text-foreground border-border">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o relatório {reports.find((r) => r.id === dialogState.data)?.name || 'Não identificado'}? Esta ação é irreversível.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogState({ type: '', open: false, data: null })} disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? 'Excluindo...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;