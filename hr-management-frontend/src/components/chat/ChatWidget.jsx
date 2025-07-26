import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Bot, User, X, Minimize2, Maximize2, Archive } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import chatService from '../../services/chatService';
import usersService from '../../services/usersService';
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const socket = io(API_BASE_URL);

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('chatbot');
  const [message, setMessage] = useState('');
  const [messagesByUser, setMessagesByUser] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      socket.emit('join', { userId: user.id });

      socket.on('newMessage', () => {
        loadMessagesForUser(selectedUserId || 'chatbot');
        loadUnreadCount();
        loadUnreadCounts();
      });

      socket.on('messageRead', (data) => {
        if (data.userId === user?.id && (data.targetUserId === selectedUserId || !data.targetUserId)) {
          loadUnreadCount();
          loadUnreadCounts();
        }
      });

      return () => {
        socket.off('newMessage');
        socket.off('messageRead');
        socket.disconnect();
      };
    }
  }, [user?.id, selectedUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedUserId, messagesByUser[selectedUserId || 'chatbot']]);

  useEffect(() => {
    if (isOpen && user?.id) {
      const loadData = async () => {
        setLoading(true);
        try {
          await loadUnreadCount();
          if (activeTab === 'users') {
            await loadUsers();
            await loadLastMessages();
            await loadUnreadCounts();
          } else if (activeTab === 'messages') {
            await loadConversations();
            if (conversations.length > 0 && !selectedUserId) {
              setSelectedUserId(conversations[0].userId);
              await loadMessagesForUser(conversations[0].userId);
              await markMessagesAsRead(user?.id, conversations[0].userId);
            }
          } else {
            await loadMessagesForUser(activeTab === 'chatbot' ? null : selectedUserId);
          }
        } catch (err) {
          console.error('Erro ao carregar dados iniciais:', err);
          setError('Falha ao carregar dados. Tente novamente.');
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [isOpen, user?.id, activeTab, selectedUserId, conversations.length]);

  const loadMessagesForUser = async (userId) => {
    setLoading(true);
    try {
      console.log('Attempting to load messages for userId:', userId, 'and current userId:', user?.id);
      const response = await chatService.getMessages({
        page: 1,
        limit: 50,
        userId: user?.id,
        targetUserId: userId,
      });
      console.log('Raw response from getMessages:', response);

      const mappedMessages = Array.isArray(response)
        ? response.map(msg => {
          const senderAvatar = msg.sender?.profile?.photoUrl || `${API_BASE_URL}/uploads/profile/default-avatar.png`;
          const receiverAvatar = msg.receiver?.profile?.photoUrl || `${API_BASE_URL}/uploads/profile/default-avatar.png`;
          console.log('Mensagem mapeada:', { senderAvatar, receiverAvatar, msg });

          return {
            id: msg.id,
            message: msg.message,
            messageType: msg.isBot ? 'bot' : 'user',
            sender_id: msg.sender_id,
            receiverId: msg.receiverId,
            timestamp: msg.timestamp,
            sender: {
              id: msg.sender_id,
              name: msg.sender?.name || 'Desconhecido',
              profile: { photoUrl: senderAvatar },
            },
            receiver: {
              id: msg.receiverId,
              name: msg.receiver?.name || 'Desconhecido',
              profile: { photoUrl: receiverAvatar },
            },
            isBot: msg.isBot,
            isRead: msg.isRead || false,
          };
        })
        : [];

      const filteredMessages = mappedMessages.filter(msg => {
        if (userId === null) {
          return (msg.sender_id === 'bot-system-id' && msg.receiverId === user?.id) ||
                 (msg.sender_id === user?.id && msg.receiverId === 'bot-system-id');
        }
        return (msg.sender_id === user?.id && msg.receiverId === userId) ||
               (msg.sender_id === userId && msg.receiverId === user?.id);
      }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      console.log('Filtered messages:', filteredMessages);
      setMessagesByUser(prev => ({
        ...prev,
        [userId || 'chatbot']: filteredMessages,
      }));
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar mensagens do usuário:', error);
      setError('Falha ao carregar mensagens do usuário.');
      setMessagesByUser(prev => ({
        ...prev,
        [userId || 'chatbot']: [],
      }));
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await chatService.getUnreadCount(user?.id);
      setUnreadCount(Number(response) || 0);
      setError(null);
      console.log('Unread count loaded:', Number(response) || 0);
    } catch (error) {
      console.error('Erro ao carregar contagem de não lidas:', error);
      setUnreadCount(0);
      setError('Falha ao carregar contagem de mensagens não lidas.');
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await usersService.getUsers(1, 50);
      console.log('API response for users:', response);
      const usersWithAvatars = response.map(user => ({
        ...user,
        profile: {
          photoUrl: user.profile?.avatar
            ? `${API_BASE_URL}${user.profile.avatar}`
            : `${API_BASE_URL}/uploads/profile/default-avatar.png`,
        },
      }));
      setUsers(usersWithAvatars || []);
      console.log('Users set to state:', usersWithAvatars || []);
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Falha ao carregar usuários.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLastMessages = async () => {
    setLoading(true);
    try {
      const response = await chatService.getLastMessages(user?.id);
      setLastMessages(response || {});
      setError(null);
      console.log('Last messages loaded:', response);
    } catch (error) {
      console.error('Erro ao carregar últimas mensagens:', error);
      setError('Falha ao carregar últimas mensagens.');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCounts = async () => {
    setLoading(true);
    try {
      const counts = {};
      for (const userItem of users) {
        if (userItem.id !== user?.id) {
          const count = await chatService.getUnreadCountByUser(user?.id, userItem.id);
          counts[userItem.id] = count || 0;
        }
      }
      setUnreadCounts(counts);
      setError(null);
      console.log('Unread counts loaded:', counts);
    } catch (error) {
      console.error('Erro ao carregar contagens de não lidas:', error);
      setError('Falha ao carregar contagens de não lidas.');
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await chatService.getConversations(user?.id);
      console.log('Conversations loaded:', response);
      setConversations(response || []);
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      setError('Falha ao carregar conversas.');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (targetUserId) => {
    try {
      await chatService.markMessagesAsRead(user?.id, targetUserId);
      await loadUnreadCount();
      await loadUnreadCounts();
      await loadMessagesForUser(targetUserId);
      socket.emit('markAsRead', { userId: user?.id, targetUserId });
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
      setError('Falha ao marcar mensagens como lidas.');
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    setLoading(true);
    const targetUserId = activeTab === 'chatbot' ? 'bot-system-id' : selectedUserId;
    const newMessage = {
      id: Date.now(),
      message: message.trim(),
      messageType: 'user',
      timestamp: new Date().toISOString(),
      sender_id: user?.id,
      receiverId: targetUserId,
      sender: {
        ...user,
        profile: {
          photoUrl: user?.profile?.avatar
            ? `${API_BASE_URL}${user.profile.avatar}`
            : `${API_BASE_URL}/uploads/profile/default-avatar.png`,
        },
      },
    };

    setMessagesByUser(prev => ({
      ...prev,
      [targetUserId || 'chatbot']: [...(prev[targetUserId || 'chatbot'] || []), newMessage].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
    }));
    setMessage('');

    try {
      await chatService.createMessage({
        message: message.trim(),
        messageType: 'user',
        recipientId: targetUserId,
      });
      await loadMessagesForUser(activeTab === 'chatbot' ? null : selectedUserId);
      await loadUnreadCount();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMessagesByUser(prev => ({
        ...prev,
        [targetUserId || 'chatbot']: prev[targetUserId || 'chatbot'].filter(msg => msg.id !== newMessage.id),
      }));
      setError('Falha ao enviar mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const archiveUser = (userId) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const startConversation = async (userId) => {
    console.log('Starting conversation with userId:', userId);
    setActiveTab('messages');
    setSelectedUserId(userId);
    await loadMessagesForUser(userId);
    await markMessagesAsRead(userId);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
            {unreadCount}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[500px]">
      <Card className={`shadow-xl transition-all duration-200 ${isMinimized ? 'h-14' : 'h-[500px]'} overflow-hidden`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 bg-card sticky top-0 z-10">
          <CardTitle className="text-sm font-medium flex items-center">
            <Bot className="h-4 w-4 mr-2" />
            {activeTab === 'chatbot' ? 'Assistente RH' : activeTab === 'users' ? 'Lista de Usuários' : 'Conversas'}
          </CardTitle>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex flex-col h-full">
          <div className="flex border-b">
            <Button
              variant={activeTab === 'chatbot' ? 'default' : 'ghost'}
              onClick={() => {
                setActiveTab('chatbot');
                setSelectedUserId(null);
                loadMessagesForUser(null);
              }}
              className="flex-1"
            >
              Chatbot
            </Button>
            <Button
              variant={activeTab === 'messages' ? 'default' : 'ghost'}
              onClick={async () => {
                setActiveTab('messages');
                await loadConversations();
                if (conversations.length > 0 && !selectedUserId) {
                  setSelectedUserId(conversations[0].userId);
                  await loadMessagesForUser(conversations[0].userId);
                  await markMessagesAsRead(user?.id, conversations[0].userId);
                }
              }}
              className="flex-1"
            >
              Conversas
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('users')}
              className="flex-1"
            >
              Usuários
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4 overflow-y-auto">
            {error && (
              <div className="text-center text-sm text-red-500 py-2">
                {error}
              </div>
            )}
            {loading && (
              <div className="text-center text-sm text-muted-foreground py-2">
                Carregando...
              </div>
            )}
            {!loading && activeTab === 'users' && users.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum usuário encontrado.</p>
              </div>
            )}
            {activeTab === 'users' && (
              <div>
                {users.map((userItem) => {
                  const lastMessage = lastMessages[userItem.id];
                  const unread = unreadCounts[userItem.id] || 0;
                  return (
                    <div
                      key={userItem.id}
                      className="flex items-center justify-between py-3 border-b cursor-pointer hover:bg-muted"
                      onClick={() => startConversation(userItem.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={userItem.profile.photoUrl}
                            alt={`${userItem.name}'s profile`}
                            className="object-cover rounded-full"
                          />
                          <AvatarFallback className="text-sm bg-gray-200">
                            {userItem.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{userItem.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {lastMessage ? `${lastMessage.message} - ${formatTime(lastMessage.timestamp)}` : 'Sem mensagens'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {unread > 0 && (
                          <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white mr-2">
                            {unread}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            archiveUser(userItem.id);
                          }}
                          className="h-8 w-8"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {activeTab !== 'users' && (
              <>
                {!loading && (messagesByUser[selectedUserId || 'chatbot'] || []).length === 0 && !error && (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Selecione uma opção ou comece a conversar!</p>
                  </div>
                )}
                {(messagesByUser[selectedUserId || 'chatbot'] || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex mb-3 ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-end space-x-2">
                      {msg.sender_id !== user?.id && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={msg.sender.profile.photoUrl}
                            alt={`${msg.sender?.name || 'Desconhecido'}'s profile`}
                            className="object-cover rounded-full"
                          />
                          <AvatarFallback className="text-xs bg-gray-200">
                            {msg.isBot ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-lg px-4 py-2 max-w-[70%] text-sm break-words ${
                          msg.sender_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        } ${!msg.isRead && msg.receiverId === user?.id ? 'border-2 border-red-500' : ''}`}
                      >
                        <p>{msg.message || 'Mensagem vazia'}</p>
                        <p className="text-xs opacity-70 mt-1">{msg.timestamp ? formatTime(msg.timestamp) : 'Sem horário'}</p>
                        {msg.sender && <p className="text-xs opacity-50">{msg.sender.name || 'Desconhecido'}</p>}
                      </div>
                      {msg.sender_id === user?.id && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={msg.sender.profile.photoUrl}
                            alt={`${user.name}'s profile`}
                            className="object-cover rounded-full"
                          />
                          <AvatarFallback className="text-xs bg-gray-200">
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>
          {activeTab !== 'users' && (
            <div className="p-4 border-t flex items-center space-x-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={loading}
              />
              <Button
                size="icon"
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                className="h-10 w-10"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatWidget;