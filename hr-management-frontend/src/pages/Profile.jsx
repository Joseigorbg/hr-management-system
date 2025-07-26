import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import profileService from '../services/profileService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    address: '',
    surname: '',
    role: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setError('Usuário não autenticado');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await profileService.getProfile(user.id);
      console.log('Profile data received for user:', user.id, JSON.stringify(data, null, 2));
      setProfile(data);
      setFormData({
        name: data.user?.name || '',
        email: data.user?.email || '',
        phone: data.phone || '',
        department: data.user?.department?.name || '',
        address: data.address || '',
        surname: data.user?.surname || '',
        role: data.user?.role || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setAvatarUrl(data.avatar ? `${API_BASE_URL}${data.avatar}` : '');
      console.log('Avatar URL atualizado:', data.avatar ? `${API_BASE_URL}${data.avatar}` : 'Nenhum avatar');
    } catch (err) {
      console.error('Erro ao buscar perfil para user:', user.id, err);
      setError(err.message || 'Erro ao carregar perfil');
      toast.error(err.message || 'Erro ao carregar perfil');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const fetchRecentActivity = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await profileService.getRecentActivity(user.id);
      console.log('Recent activity data for user:', user.id, JSON.stringify(data, null, 2));
      setRecentActivity(data);
    } catch (err) {
      console.error('Erro ao buscar atividades para user:', user.id, err);
      toast.error(err.message || 'Erro ao carregar atividades');
    }
  }, [user?.id]);

  useEffect(() => {
    console.log('User state:', JSON.stringify(user, null, 2));
    if (user?.id) {
      fetchProfile();
      fetchRecentActivity();
    } else {
      setIsLoading(false);
      setError('Usuário não autenticado');
    }
  }, [fetchProfile, fetchRecentActivity, user]);

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const updatedData = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
      };
      await profileService.updateProfile(updatedData);
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
      await fetchProfile();
    } catch (err) {
      console.error('Erro ao atualizar perfil para user:', user.id, err);
      toast.error(err.message || 'Erro ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!avatarFile) {
      toast.error('Selecione uma imagem para o avatar');
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', avatarFile);
      for (let [key, value] of formData.entries()) {
        console.log('FormData entry:', key, value, value instanceof File);
      }
      const response = await profileService.updateAvatar(formData);
      toast.success('Avatar atualizado com sucesso!');
      setAvatarFile(null);
      setAvatarUrl('');
      await fetchProfile();
      await fetchRecentActivity();
    } catch (err) {
      console.error('Erro ao atualizar avatar para user:', user.id, err);
      toast.error(err.message || 'Erro ao atualizar avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    setIsLoading(true);
    try {
      await profileService.updatePassword(user.id, formData.currentPassword, formData.newPassword);
      toast.success('Senha atualizada com sucesso!');
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Erro ao atualizar senha para user:', user.id, err);
      toast.error(err.message || 'Erro ao atualizar senha');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
      console.log('Arquivo de avatar selecionado para user:', user.id, file.name);
    } else {
      toast.error('Por favor, selecione uma imagem válida');
    }
  };

  const handleImageError = () => {
    console.error('Erro ao carregar imagem do avatar para user:', user.id, avatarUrl);
    setAvatarUrl('');
  };

  if (isLoading) return <p>Carregando...</p>;

  if (error) return <p>{error}. Tente fazer login novamente.</p>;

  if (!profile) return <p>Erro ao carregar perfil. Tente novamente.</p>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Perfil</h1>
      <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <span>{profile.user?.name?.charAt(0) || 'U'}</span>
                )}
              </div>
              <div>
                <CardTitle>{profile.user?.name || 'Usuário'}</CardTitle>
                <p className="text-sm text-muted-foreground">{profile.user?.role || 'Sem cargo'}</p>
                <p className="text-sm text-muted-foreground">
                  <a href={`mailto:${profile.user?.email || ''}`}>
                    {profile.user?.email || 'email@example.com'}
                  </a>
                </p>
                <p className="text-sm text-muted-foreground">{formData.phone || 'Sem telefone'}</p>
                <p className="text-sm text-muted-foreground">
                  {profile.user?.department?.name || 'Sem departamento'}
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => setIsEditing(!isEditing)} disabled={isLoading}>
              {isEditing ? 'Cancelar' : 'Editar'}
            </Button>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nome"
                  className="bg-input text-foreground border-border"
                />
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="bg-input text-foreground border-border"
                  disabled
                />
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Telefone"
                  className="bg-input text-foreground border-border"
                />
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Endereço"
                  className="bg-input text-foreground border-border"
                />
                <div>
                  <label htmlFor="avatar-upload" className="text-sm text-muted-foreground">
                    Escolher Avatar
                  </label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="bg-input text-foreground border-border"
                  />
                </div>
                <Button onClick={handleUpdateProfile} disabled={isLoading}>
                  Salvar Alterações
                </Button>
                <Button onClick={handleUpdateAvatar} className="ml-2" disabled={isLoading || !avatarFile}>
                  Atualizar Avatar
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <p><strong>Sobrenome:</strong> {profile.user?.surname || 'Não informado'}</p>
                  <p><strong>Telefone:</strong> {formData.phone || 'Não informado'}</p>
                  <p><strong>Cargo:</strong> {profile.user?.role || 'Não informado'}</p>
                </div>
                <div>
                  <p><strong>Departamento:</strong> {profile.user?.department?.name || 'Não informado'}</p>
                  <p><strong>Endereço:</strong> {formData.address || 'Não informado'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações de Segurança</CardTitle>
            <p className="text-muted-foreground">Altere sua senha</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleUpdatePassword}>
              <Input
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Senha Atual"
                className="bg-input text-foreground border-border"
              />
              <Input
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Nova Senha"
                className="bg-input text-foreground border-border"
              />
              <Input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirmar Nova Senha"
                className="bg-input text-foreground border-border"
              />
              <Button
                className="bg-primary text-primary-foreground"
                disabled={isLoading}
                type="submit"
              >
                Alterar Senha
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <ul className="space-y-2">
                {recentActivity.map((activity, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {activity.description} - {new Date(activity.timestamp).toLocaleString('pt-BR')}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;