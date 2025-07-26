import { api } from '../contexts/AuthContext';

const chatService = {
  async getMessages({ page = 1, limit = 50, userId = null, targetUserId = null }) {
    try {
      console.log('Buscando mensagens:', { page, limit, userId, targetUserId });

      const response = await api.get('/chat/messages', {
        params: {
          page,
          limit,
          userId,
          targetUserId,
        },
      });

      const messages = response.data.data || [];
      console.log('Mensagens recebidas:', messages.map(m => ({
        id: m.id,
        sender_id: m.sender_id,
        receiverId: m.receiverId,
        message: m.message,
        isBot: m.isBot,
        timestamp: m.timestamp,
      })));
      return messages;
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error.response?.data || error.message);
      throw error;
    }
  },

  async getUnreadCount(userId) {
    try {
      console.log('Buscando contagem de mensagens não lidas para userId:', userId);
      const response = await api.get('/chat/unread-count');
      const count = typeof response.data.data === 'number' ? response.data.data : 0;
      console.log('Contagem de não lidas recebida:', count);
      if (typeof count !== 'number') {
        throw new Error('Formato de resposta inválido para contagem de não lidas');
      }
      return count;
    } catch (error) {
      console.error('Erro ao carregar contagem de não lidas:', error.response?.data || error.message);
      throw error;
    }
  },

  async createMessage({ message, messageType = 'user', recipientId }) {
    try {
      console.log('Criando mensagem:', { message, messageType, recipientId });
      const response = await api.post('/chat/messages', {
        message,
        messageType,
        recipientId,
      });
      console.log('Mensagem criada:', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao criar mensagem:', error.response?.data || error.message);
      throw error;
    }
  },

  async getLastMessages(userId) {
    try {
      console.log('Buscando últimas mensagens para userId:', userId);
      const response = await api.get('/chat/last-messages');
      console.log('Últimas mensagens recebidas:', response.data.data);
      return response.data.data || {};
    } catch (error) {
      console.error('Erro ao carregar últimas mensagens:', error.response?.data || error.message);
      throw error;
    }
  },

  async getUnreadCountByUser(userId, targetUserId) {
    try {
      console.log('Buscando contagem de não lidas por usuário:', { userId, targetUserId });
      const response = await api.get('/chat/unread-count-by-user', {
        params: { userId, targetUserId },
      });
      const count = response.data.data ?? 0;
      console.log('Contagem de não lidas por usuário recebida:', count);
      return count;
    } catch (error) {
      console.error('Erro ao carregar contagem de não lidas por usuário:', error.response?.data || error.message);
      throw error;
    }
  },

  async getConversations(userId) {
    try {
      console.log('Buscando conversas para userId:', userId);
      const response = await api.get('/chat/conversations');
      console.log('Conversas recebidas:', response.data.data);
      return response.data.data || [];
    } catch (error) {
      console.error('Erro ao carregar conversas:', error.response?.data || error.message);
      throw error;
    }
  },

  async markMessagesAsRead(userId, targetUserId) {
    try {
      console.log('Marcando mensagens como lidas para userId:', userId, 'targetUserId:', targetUserId);
      const response = await api.post('/chat/mark-read', {
        userId,
        targetUserId,
      });
      console.log('Resposta de markMessagesAsRead:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default chatService;