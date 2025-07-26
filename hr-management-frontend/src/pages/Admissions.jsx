import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Search, Plus, Edit, Trash2, Upload, Eye, X } from 'lucide-react';
import { admissionService } from '../services/admissionService';

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError = () => ({ hasError: true });
  componentDidCatch(error, info) { console.error('Erro capturado:', error, info); }
  render = () => this.state.hasError ? <div className="text-center text-red-500">Algo deu errado.</div> : this.props.children;
}

const Admissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [admissionToDelete, setAdmissionToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedBenefits, setSelectedBenefits] = useState({});
  const [customBenefits, setCustomBenefits] = useState([{ key: '', value: '' }]);

  const predefinedBenefits = [
    { key: 'vale_refeicao', label: 'Vale Refeição', defaultValue: 500 },
    { key: 'plano_saude', label: 'Plano de Saúde', defaultValue: true },
    { key: 'vale_transporte', label: 'Vale Transporte', defaultValue: 200 },
    { key: 'seguro_vida', label: 'Seguro de Vida', defaultValue: true },
    { key: 'bonus_anual', label: 'Bônus Anual', defaultValue: 1000 },
  ];

  const initialAdmission = {
    userId: '', phone: '', address: '', hireDate: '', salary: '', contractType: 'CLT',
    positionId: '', departmentId: '', status: 'active', benefits: '{}', documents: [],
    terminationDate: '', terminationReason: '',
  };

  const [newAdmission, setNewAdmission] = useState(initialAdmission);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [usersData, positionsData, departmentsData, admissionsData] = await Promise.all([
          admissionService.fetchUsers(),
          admissionService.fetchPositions(),
          admissionService.fetchDepartments(),
          admissionService.fetchAdmissions(),
        ]);
        setUsers(usersData);
        setPositions(positionsData);
        setDepartments(departmentsData);
        setAdmissions(admissionsData);
      } catch (err) {
        toast.error('Erro ao carregar dados.', { duration: 3000 });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    admissionService.fetchAdmissions(searchTerm).then(setAdmissions).finally(() => setIsLoading(false));
  }, [searchTerm]);

  const validateAdmission = (admission, isUpdate = false) => {
    const errors = {};
    if (!isUpdate && !admission.userId) errors.userId = 'Selecione um colaborador';
    if (!admission.hireDate) errors.hireDate = 'Data de admissão é obrigatória';
    if (!admission.salary || isNaN(parseFloat(admission.salary)) || parseFloat(admission.salary) <= 0)
      errors.salary = 'Salário deve ser um número válido maior que zero';
    if (!admission.positionId) errors.positionId = 'Cargo é obrigatório';
    if (!admission.departmentId) errors.departmentId = 'Departamento é obrigatório';
    if (admission.status === 'terminated' && !admission.terminationDate)
      errors.terminationDate = 'Data de desligamento é obrigatória';
    if (admission.status === 'terminated' && !admission.terminationReason)
      errors.terminationReason = 'Motivo do desligamento é obrigatório';
    return errors;
  };

  const generateBenefitsJson = () => {
    const selectedPredefined = Object.entries(selectedBenefits)
      .filter(([, { checked }]) => checked)
      .reduce((acc, [key, { value }]) => {
        const benefit = predefinedBenefits.find(b => b.key === key);
        let parsedValue = value || benefit.defaultValue;
        if (typeof parsedValue === 'string') {
          parsedValue = parsedValue === 'true' ? true : parsedValue === 'false' ? false : !isNaN(parseFloat(parsedValue)) ? parseFloat(parsedValue) : parsedValue;
        }
        return { ...acc, [key]: parsedValue };
      }, {});
    const customJson = customBenefits
      .filter(cb => cb.key && cb.value !== '')
      .reduce((acc, { key, value }) => {
        let parsedValue = value;
        try { parsedValue = JSON.parse(value); } catch {
          parsedValue = value === 'true' ? true : value === 'false' ? false : !isNaN(parseFloat(value)) ? parseFloat(value) : value;
        }
        return { ...acc, [key]: parsedValue };
      }, {});
    return JSON.stringify({ ...selectedPredefined, ...customJson });
  };

  const handleFileChange = e => setSelectedFiles(Array.from(e.target.files));
  const removeSelectedFile = index => setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  const handleBenefitChange = key => checked => setSelectedBenefits(prev => ({ ...prev, [key]: { checked, value: prev[key]?.value || predefinedBenefits.find(b => b.key === key)?.defaultValue || '' } }));
  const handleBenefitValueChange = key => e => setSelectedBenefits(prev => ({ ...prev, [key]: { ...prev[key], value: e.target.value } }));
  const addCustomBenefit = () => setCustomBenefits([...customBenefits, { key: '', value: '' }]);
  const updateCustomBenefit = (index, field, value) => setCustomBenefits(prev => {
    const newBenefits = [...prev];
    newBenefits[index][field] = value;
    return newBenefits;
  });
  const removeCustomBenefit = index => setCustomBenefits(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : [{ key: '', value: '' }]);

  const handleCreateAdmission = async e => {
    e.preventDefault();
    const validationErrors = validateAdmission(newAdmission);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return toast.error('Preencha todos os campos obrigatórios.', { duration: 3000 });
    setIsLoading(true);
    try {
      const benefits = generateBenefitsJson();
      const admissionData = { ...newAdmission, salary: parseFloat(newAdmission.salary).toString(), benefits };
      await admissionService.createAdmission(admissionData, selectedFiles);
      if (newAdmission.phone || newAdmission.address) await admissionService.updateProfile({ phone: newAdmission.phone, address: newAdmission.address });
      setAdmissions(await admissionService.fetchAdmissions(searchTerm));
      setIsCreateDialogOpen(false);
      resetForm();
    } catch {
      // Erro já tratado no serviço
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAdmission = async e => {
    e.preventDefault();
    if (!selectedAdmission) return toast.error('Nenhuma admissão selecionada.', { duration: 3000 });
    const validationErrors = validateAdmission(selectedAdmission, true);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return toast.error('Preencha todos os campos obrigatórios.', { duration: 3000 });
    setIsLoading(true);
    try {
      const benefits = generateBenefitsJson();
      const admissionData = { ...selectedAdmission, salary: Number(selectedAdmission.salary).toString(), benefits };
      await admissionService.updateAdmission(selectedAdmission.id, admissionData, selectedFiles);
      if (selectedAdmission.phone || selectedAdmission.address) await admissionService.updateProfile({ phone: selectedAdmission.phone, address: selectedAdmission.address });
      setAdmissions(await admissionService.fetchAdmissions(searchTerm));
      setSelectedAdmission(null);
      resetForm();
    } catch {
      // Erro já tratado no serviço
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAdmission = async () => {
    if (!admissionToDelete) return;
    setIsLoading(true);
    try {
      await admissionService.deleteAdmission(admissionToDelete);
      setAdmissions(await admissionService.fetchAdmissions(searchTerm));
      setIsDeleteDialogOpen(false);
      setAdmissionToDelete(null);
    } catch {
      // Erro já tratado no serviço
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (admissionId, documentId) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return;
    try {
      await admissionService.deleteDocument(admissionId, documentId);
      setAdmissions(await admissionService.fetchAdmissions(searchTerm));
    } catch {
      // Erro já tratado no serviço
    }
  };

  const resetForm = () => {
    setNewAdmission(initialAdmission);
    setSelectedFiles([]);
    setSelectedBenefits({});
    setCustomBenefits([{ key: '', value: '' }]);
    setErrors({});
  };

  const getStatusLabel = status => ({
    active: 'Ativo', vacation: 'Férias', inactive: 'Inativo', terminated: 'Desligado'
  }[status] || 'Desconhecido');

  const getStatusColor = status => ({
    Ativo: 'bg-green-100 text-green-800',
    Férias: 'bg-blue-100 text-blue-800',
    Inativo: 'bg-red-100 text-red-800',
    Desligado: 'bg-gray-100 text-gray-800'
  }[getStatusLabel(status)] || 'bg-gray-100 text-gray-800');

  const getUserInitials = name => name ? name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) : 'ND';

  const getUserName = useCallback(admission => {
    if (!admission?.id || !admission?.user?.id) {
      if (process.env.NODE_ENV === 'development') console.warn('Admissão inválida:', admission);
      return 'Não identificado';
    }
    const user = admission.user || users.find(u => u.id === admission.userId);
    return user ? `${user.name} ${user.surname || ''}`.trim() : 'Não identificado';
  }, [users]);

  const FormFields = ({ admission, setAdmission, isEdit = false }) => (
    <div className="grid gap-4 md:grid-cols-2">
      {[
        { label: 'Colaborador', id: 'userId', type: 'select', options: users.map(u => ({ value: u.id, label: `${u.name} ${u.surname || ''}` })), disabled: isEdit },
        { label: 'Telefone', id: 'phone', type: 'text' },
        { label: 'Endereço', id: 'address', type: 'text' },
        { label: 'Data de Admissão', id: 'hireDate', type: 'date' },
        { label: 'Salário', id: 'salary', type: 'number' },
        { label: 'Tipo de Contrato', id: 'contractType', type: 'select', options: ['CLT', 'PJ', 'Estágio'].map(v => ({ value: v, label: v })) },
        { label: 'Cargo', id: 'positionId', type: 'select', options: positions.map(p => ({ value: p.id, label: p.name })) },
        { label: 'Departamento', id: 'departmentId', type: 'select', options: departments.map(d => ({ value: d.id, label: d.name })) },
        { label: 'Status', id: 'status', type: 'select', options: ['active', 'vacation', 'inactive', 'terminated'].map(s => ({ value: s, label: getStatusLabel(s) })) },
      ].map(field => (
        <div key={field.id}>
          <Label htmlFor={`${field.id}-${isEdit ? 'edit' : 'create'}`}>{field.label}</Label>
          {field.type === 'select' ? (
            <Select
              value={admission[field.id] ?? ''}
              onValueChange={value => {
                setAdmission(prev => ({ ...prev, [field.id]: value }));
                if (field.id === 'userId' && value) admissionService.fetchUserDetails(value).then(({ phone, address }) => setAdmission(prev => ({ ...prev, phone, address })));
              }}
              disabled={isLoading || field.disabled}
            >
              <SelectTrigger id={`${field.id}-${isEdit ? 'edit' : 'create'}`} className="mt-1">
                <SelectValue placeholder={`Selecione ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={`${field.id}-${isEdit ? 'edit' : 'create'}`}
              type={field.type}
              value={admission[field.id] ?? ''}
              onChange={e => setAdmission(prev => ({ ...prev, [field.id]: e.target.value }))}
              className="mt-1"
              disabled={isLoading}
            />
          )}
          {errors[field.id] && <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>}
        </div>
      ))}
      {admission.status === 'terminated' && (
        <>
          <div>
            <Label htmlFor={`terminationDate-${isEdit ? 'edit' : 'create'}`}>Data de Desligamento</Label>
            <Input
              id={`terminationDate-${isEdit ? 'edit' : 'create'}`}
              type="date"
              value={admission.terminationDate ?? ''}
              onChange={e => setAdmission(prev => ({ ...prev, terminationDate: e.target.value }))}
              className="mt-1"
              disabled={isLoading}
            />
            {errors.terminationDate && <p className="text-red-500 text-sm mt-1">{errors.terminationDate}</p>}
          </div>
          <div className="col-span-2">
            <Label htmlFor={`terminationReason-${isEdit ? 'edit' : 'create'}`}>Motivo do Desligamento</Label>
            <Input
              id={`terminationReason-${isEdit ? 'edit' : 'create'}`}
              value={admission.terminationReason ?? ''}
              onChange={e => setAdmission(prev => ({ ...prev, terminationReason: e.target.value }))}
              className="mt-1"
              disabled={isLoading}
            />
            {errors.terminationReason && <p className="text-red-500 text-sm mt-1">{errors.terminationReason}</p>}
          </div>
        </>
      )}
      <div className="col-span-2">
        <Label>Benefícios Pré-definidos</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {predefinedBenefits.map(benefit => (
            <div key={benefit.key} className="flex items-center space-x-4 p-3 bg-muted rounded-md hover:bg-muted/80">
              <Checkbox
                id={`benefit-${benefit.key}-${isEdit ? 'edit' : 'create'}`}
                checked={!!selectedBenefits[benefit.key]?.checked}
                onCheckedChange={handleBenefitChange(benefit.key)}
                className="h-6 w-6"
                disabled={isLoading}
              />
              <Label htmlFor={`benefit-${benefit.key}-${isEdit ? 'edit' : 'create'}`}>{benefit.label}</Label>
              {selectedBenefits[benefit.key]?.checked && (
                <Input
                  type="text"
                  value={selectedBenefits[benefit.key]?.value || ''}
                  onChange={handleBenefitValueChange(benefit.key)}
                  className="w-24"
                  placeholder="Valor"
                  disabled={isLoading}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-2">
        <Label>Benefícios Adicionais</Label>
        {customBenefits.map((benefit, index) => (
          <div key={index} className="flex items-center gap-2 mt-2">
            <Input
              placeholder="Chave (ex.: vale_educacao)"
              value={benefit.key}
              onChange={e => updateCustomBenefit(index, 'key', e.target.value)}
              className="flex-1"
              disabled={isLoading}
            />
            <Input
              placeholder="Valor (ex.: 300 ou true)"
              value={benefit.value}
              onChange={e => updateCustomBenefit(index, 'value', e.target.value)}
              className="flex-1"
              disabled={isLoading}
            />
            <Button variant="ghost" size="icon" onClick={() => removeCustomBenefit(index)} className="text-destructive hover:text-destructive/80" disabled={isLoading}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" onClick={addCustomBenefit} className="mt-2 text-muted-foreground" disabled={isLoading}>
          Adicionar Benefício
        </Button>
      </div>
      <div className="col-span-2">
        <Label>{isEdit ? 'Enviar Novos Documentos' : 'Documentos'}</Label>
        <div className="flex items-center space-x-2 mt-1">
          <Input type="file" multiple onChange={handleFileChange} className="w-full" disabled={isLoading} />
          <Upload className="h-5 w-5 text-muted-foreground" />
        </div>
        {selectedFiles.length > 0 && (
          <ul className="mt-2 space-y-1">
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex items-center justify-between">
                <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => window.open(URL.createObjectURL(file), '_blank')}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => removeSelectedFile(index)} disabled={isLoading}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {isEdit && admission.documents?.length > 0 && (
        <div className="col-span-2">
          <Label>Documentos Enviados</Label>
          <ul className="mt-2 space-y-1">
            {admission.documents.map(doc => (
              <li key={doc.id} className="flex items-center justify-between">
                <span>{doc.fileName} ({(doc.fileSize / 1024).toFixed(2)} KB)</span>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => window.open(`/api/admissions/${admission.id}/documents/${doc.id}`, '_blank')}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDeleteDocument(admission.id, doc.id)} disabled={isLoading}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Admissões</h1>
            <p className="text-muted-foreground">Gerencie admissões e desligamentos</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[150px]" disabled={isLoading}>
            <Plus className="mr-2 h-4 w-4" /> Nova Admissão
          </Button>
        </div>
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Buscar Admissões</CardTitle></CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email, cargo ou departamento..."
                value={searchTerm ?? ''}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 bg-input text-foreground border-border"
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Lista de Admissões ({admissions.length})</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
              </div>
            ) : admissions.length === 0 ? (
              <Table><TableBody><TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">Nenhuma admissão encontrada</TableCell></TableRow></TableBody></Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {['Colaborador', 'Cargo', 'Departamento', 'Benefícios', 'Documentos', 'Status', 'Data de Desligamento', 'Motivo do Desligamento', 'Ações'].map(h => <TableHead key={h}>{h}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admissions.map(admission => (
                    <TableRow key={admission.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar><AvatarFallback className="text-sm bg-muted">{getUserInitials(getUserName(admission))}</AvatarFallback></Avatar>
                          <div>
                            <div className="font-medium">{getUserName(admission)}</div>
                            <div className="text-sm text-muted-foreground">{admission.user?.email || users.find(u => u.id === admission.userId)?.email || 'Não identificado'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{admission.position?.name || 'Não definido'}</TableCell>
                      <TableCell>{admission.department?.name || 'Não definido'}</TableCell>
                      <TableCell>
                        {admission.benefits ? (
                          (() => {
                            try {
                              const benefits = typeof admission.benefits === 'string' ? JSON.parse(admission.benefits) : admission.benefits || {};
                              return Object.entries(benefits).map(([key, value]) => `${predefinedBenefits.find(b => b.key === key)?.label || key}: ${value}`).join(', ');
                            } catch {
                              return 'Benefícios inválidos';
                            }
                          })()
                        ) : 'Nenhum benefício registrado'}
                      </TableCell>
                      <TableCell>
                        {admission.documents?.length ? (
                          <ul className="space-y-1">
                            {admission.documents.map(doc => (
                              <li key={doc.id} className="flex items-center justify-between">
                                <span>{doc.fileName}</span>
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => window.open(`/api/admissions/${admission.id}/documents/${doc.id}`, '_blank')}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDeleteDocument(admission.id, doc.id)} disabled={isLoading}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : 'Nenhum documento registrado'}
                      </TableCell>
                      <TableCell><Badge className={getStatusColor(admission.status)}>{getStatusLabel(admission.status)}</Badge></TableCell>
                      <TableCell>{admission.terminationDate ? new Date(admission.terminationDate).toLocaleDateString('pt-BR') : '-'}</TableCell>
                      <TableCell>{admission.terminationReason || '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-accent-foreground hover:text-accent"
                            onClick={() => {
                              const benefits = typeof admission.benefits === 'string' ? JSON.parse(admission.benefits) : admission.benefits || {};
                              const newSelectedBenefits = predefinedBenefits.reduce((acc, b) => ({
                                ...acc, [b.key]: { checked: !!benefits[b.key], value: benefits[b.key]?.toString() || b.defaultValue.toString() }
                              }), {});
                              const custom = Object.entries(benefits)
                                .filter(([key]) => !predefinedBenefits.some(b => b.key === key))
                                .map(([key, value]) => ({ key, value: value.toString() }));
                              setSelectedBenefits(newSelectedBenefits);
                              setCustomBenefits(custom.length ? custom : [{ key: '', value: '' }]);
                              setSelectedAdmission({
                                ...admission,
                                userId: admission.user?.id || admission.userId || '',
                                phone: admission.phone || admission.user?.profile?.phone || '',
                                address: admission.address || admission.user?.profile?.address || '',
                                hireDate: admission.hireDate?.split('T')[0] || '',
                                salary: admission.salary?.toString() || '',
                                contractType: admission.contractType || 'CLT',
                                status: admission.status || 'active',
                                positionId: admission.position?.id || admission.positionId || '',
                                departmentId: admission.department?.id || admission.departmentId || '',
                                documents: admission.documents || [],
                                terminationDate: admission.terminationDate?.split('T')[0] || '',
                                terminationReason: admission.terminationReason || '',
                              });
                              if (admission.user?.id || admission.userId) admissionService.fetchUserDetails(admission.user?.id || admission.userId).then(({ phone, address }) => setSelectedAdmission(prev => ({ ...prev, phone, address })));
                            }}
                            disabled={isLoading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive/80"
                            onClick={() => { setAdmissionToDelete(admission.id); setIsDeleteDialogOpen(true); }}
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
        <Dialog open={isCreateDialogOpen} onOpenChange={open => { setIsCreateDialogOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="bg-card text-foreground border-border max-w-[90vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Criar Nova Admissão</DialogTitle>
              <DialogDescription>Insira os detalhes para uma nova admissão ou desligamento</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAdmission}>
              <FormFields admission={newAdmission} setAdmission={setNewAdmission} />
              <DialogFooter className="mt-6 flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)} className="text-muted-foreground" disabled={isLoading}>Cancelar</Button>
                <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">Criar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={!!selectedAdmission} onOpenChange={() => { setSelectedAdmission(null); resetForm(); }}>
          <DialogContent className="bg-card text-foreground border-border max-w-[90vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Editar Admissão</DialogTitle>
              <DialogDescription>Atualize os detalhes de {selectedAdmission ? getUserName(selectedAdmission) : 'Nova Admissão'}</DialogDescription>
            </DialogHeader>
            {selectedAdmission && (
              <form onSubmit={handleUpdateAdmission}>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20"><AvatarFallback className="text-lg bg-muted">{getUserInitials(getUserName(selectedAdmission))}</AvatarFallback></Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{getUserName(selectedAdmission)}</h3>
                      <p className="text-muted-foreground">{selectedAdmission.position?.name || 'Não definido'}</p>
                      <Badge className={getStatusColor(selectedAdmission.status)}>{getStatusLabel(selectedAdmission.status)}</Badge>
                    </div>
                  </div>
                  <FormFields admission={selectedAdmission} setAdmission={setSelectedAdmission} isEdit />
                </div>
                <DialogFooter className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" type="button" onClick={() => setSelectedAdmission(null)} className="text-muted-foreground" disabled={isLoading}>Cancelar</Button>
                  <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">Salvar Alterações</Button>
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
                Tem certeza que deseja desativar esta admissão? Colaborador: {admissionToDelete ? getUserName(admissions.find(adm => adm.id === admissionToDelete) || null) : 'Não identificado'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setIsDeleteDialogOpen(false); setAdmissionToDelete(null); }} className="text-muted-foreground" disabled={isLoading}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDeleteAdmission} disabled={isLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {isLoading ? 'Desativando...' : 'Confirmar Desativação'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
};

export default Admissions;