import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '../contexts/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchUsers();
  }, []);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/groups');
      console.log('API response for groups:', response.data);
      const groupsData = Array.isArray(response.data.data) ? response.data.data : [];
      setGroups(groupsData);
    } catch (error) {
      console.error('Erro ao buscar grupos:', error.response?.data || error.message);
      toast.error('Erro ao carregar grupos', { duration: 3000 });
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = { page: 1, limit: 100, include: 'admission', status: 'active' };
      const response = await api.get('/users', { params });
      const usersData = Array.isArray(response.data.data) ? response.data.data : response.data || [];
      const filteredUsers = usersData.filter(user => user.isActive && (!user.admissions || user.admissions.status === 'active'));
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error.response?.data || error.message);
      toast.error('Erro ao carregar usuários', { duration: 3000 });
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error('O nome do grupo é obrigatório', { duration: 3000 });
      return;
    }
    try {
      setIsLoading(true);
      const payload = { name: newGroupName.trim() };
      console.log('Enviando para criar grupo:', JSON.stringify(payload));
      await api.post('/api/groups', payload);
      // Alternativa: descomentar se o backend esperar { group: { name: string } }
      // const payload = { group: { name: newGroupName.trim() } };
      // console.log('Enviando para criar grupo:', JSON.stringify(payload));
      // await api.post('/api/groups', payload);
      setNewGroupName('');
      toast.success('Grupo criado com sucesso!', { duration: 3000 });
      fetchGroups();
    } catch (error) {
      console.error('Erro ao criar grupo:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message
        ? Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message
        : 'Erro ao criar grupo';
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUserToGroup = async () => {
    if (!selectedGroup || !selectedUser) {
      toast.error('Selecione um grupo e um usuário', { duration: 3000 });
      return;
    }
    try {
      setIsLoading(true);
      await api.post('/api/groups/add-user', {
        groupId: selectedGroup,
        userId: selectedUser,
      });
      toast.success('Usuário adicionado ao grupo com sucesso!', { duration: 3000 });
      setSelectedUser('');
      fetchGroups();
    } catch (error) {
      console.error('Erro ao adicionar usuário ao grupo:', error.response?.data || error.message);
      toast.error('Erro ao adicionar usuário ao grupo', { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-full mx-auto min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Gerenciar Grupos</h1>
      <p className="text-sm sm:text-base text-muted-foreground">Crie e gerencie grupos de tarefas.</p>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-foreground">Criar Novo Grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Nome do grupo"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="bg-input border-border text-foreground"
              disabled={isLoading}
            />
            <Button
              onClick={handleCreateGroup}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? 'Criando...' : 'Criar Grupo'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-foreground">Gerenciar Usuários nos Grupos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select
              value={selectedGroup}
              onValueChange={setSelectedGroup}
              disabled={isLoading || groups.length === 0}
            >
              <SelectTrigger className="bg-input border-border text-foreground w-full">
                <SelectValue placeholder="Selecione um grupo" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground max-h-[200px] overflow-y-auto">
                {Array.isArray(groups) && groups.length > 0 ? (
                  groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center text-muted-foreground">
                    Nenhum grupo disponível
                  </div>
                )}
              </SelectContent>
            </Select>
            <Select
              value={selectedUser}
              onValueChange={setSelectedUser}
              disabled={isLoading || !selectedGroup || users.length === 0}
            >
              <SelectTrigger className="bg-input border-border text-foreground w-full">
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground max-h-[200px] overflow-y-auto">
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {`${user.name} (${user.email})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAddUserToGroup}
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
              disabled={isLoading || !selectedGroup || !selectedUser}
            >
              {isLoading ? 'Adicionando...' : 'Adicionar Usuário ao Grupo'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-foreground">Lista de Grupos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : Array.isArray(groups) && groups.length > 0 ? (
            <ul className="space-y-2">
              {groups.map((group) => (
                <li key={group.id} className="p-2 bg-input border-border rounded">
                  <div className="flex justify-between items-center">
                    <span>{group.name}</span>
                    <span className="text-sm text-muted-foreground">
                      Usuários: {group.users?.length || 0}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted-foreground">Nenhum grupo cadastrado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Groups;