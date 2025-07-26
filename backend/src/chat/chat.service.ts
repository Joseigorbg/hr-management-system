import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Prisma } from '@prisma/client'; // Import Prisma types

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createMessage(createMessageDto: CreateMessageDto) {
    try {
      console.log('Criando mensagem com DTO:', createMessageDto);
      const message = await this.prisma.chatMessage.create({
        data: {
          sender: createMessageDto.senderId ? { connect: { id: createMessageDto.senderId } } : undefined,
          receiver: createMessageDto.recipientId ? { connect: { id: createMessageDto.recipientId } } : undefined,
          message: createMessageDto.message,
          isBot: createMessageDto.messageType === 'bot',
          messageType: 'text',
          isRead: false, // Default to unread
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!createMessageDto.recipientId && createMessageDto.messageType === 'user') {
        setTimeout(async () => {
          const botResponse = this.generateBotResponse(createMessageDto.message);
          console.log('Gerando resposta do bot:', botResponse);
          await this.prisma.chatMessage.create({
            data: {
              sender: { connect: { id: 'bot-system-id' } },
              receiver: { connect: { id: createMessageDto.senderId } },
              message: botResponse,
              isBot: true,
              messageType: 'text',
              isRead: false, // Default to unread
            },
          });
        }, 1000);
      }

      return message;
    } catch (error) {
      console.error('Erro ao criar mensagem:', error.message, 'Stack:', error.stack);
      throw new Error('Falha ao criar mensagem');
    }
  }

  async getMessages(userId: string, page: number = 1, limit: number = 50, targetUserId?: string) {
    const skip = (page - 1) * limit;  

    let whereClause: Prisma.ChatMessageWhereInput;
    if (targetUserId) {
      console.log(`Filtering messages for userId: ${userId}, targetUserId: ${targetUserId}`);
      whereClause = {
        OR: [
          { sender_id: userId, receiverId: targetUserId },
          { sender_id: targetUserId, receiverId: userId },
        ],
      };
    } else {
      console.log(`Filtering all messages for userId: ${userId}`);
      whereClause = {
        OR: [
          { sender_id: userId },
          { receiverId: userId },
        ],
      };
    }  

    console.log('Where clause applied:', whereClause);  

    const messages = await this.prisma.chatMessage.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                avatar: true,
              },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      skip,
      take: limit,
    });  

    // Map messages with default avatar fallback using /uploads prefix
    const messagesWithAvatars = messages.map(m => ({
      id: m.id,
      sender_id: m.sender_id,
      receiverId: m.receiverId,
      message: m.message,
      isBot: m.isBot,
      timestamp: m.timestamp,
      sender: {
        id: m.sender.id,
        name: m.sender.name || 'Desconhecido',
        profile: {
          photoUrl: m.sender.profile?.avatar ? `/uploads/profile/${m.sender.profile.avatar}` : '/uploads/profile/default.png', // Updated to default.png
        },
      },
      receiver: {
        id: m.receiver.id,
        name: m.receiver.name || 'Desconhecido',
        profile: {
          photoUrl: m.receiver.profile?.avatar ? `/uploads/profile/${m.receiver.profile.avatar}` : '/uploads/profile/default.png', // Updated to default.png
        },
      },
    }));

    console.log('Messages retrieved with avatars:', messagesWithAvatars.map(m => ({
      id: m.id,
      sender_id: m.sender_id,
      receiverId: m.receiverId,
      message: m.message,
      isBot: m.isBot,
      senderAvatar: m.sender.profile.photoUrl,
      receiverAvatar: m.receiver.profile.photoUrl,
    })));  

    return messagesWithAvatars;
  }

  async getUnreadCount(userId: string) {
    try {
      console.log('Contando mensagens não lidas para userId:', userId);
      if (!userId) {
        throw new Error('userId é undefined');
      }
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      console.log('Usuário encontrado:', user);
      if (!user) {
        throw new Error(`Usuário com ID ${userId} não encontrado`);
      }

      const count = await this.prisma.chatMessage.count({
        where: {
          receiverId: userId,
          isRead: false,
        },
      });

      console.log('Contagem de não lidas:', count);
      return count;
    } catch (error) {
      console.error('Erro em getUnreadCount:', error.message, 'Stack:', error.stack);
      throw new Error('Falha ao contar mensagens não lidas');
    }
  }

  async getConversations(userId: string) {
    try {
      const conversations = await this.prisma.chatMessage.findMany({
        where: {
          OR: [
            { sender_id: userId },
            { receiverId: userId },
          ],
        },
        select: {
          sender_id: true,
          receiverId: true,
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          message: true,
          timestamp: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      const conversationMap = new Map();
      conversations.forEach(msg => {
        const otherUserId = msg.sender_id === userId ? msg.receiverId : msg.sender_id;
        if (otherUserId && !conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            userId: otherUserId,
            lastMessage: msg.message,
            lastMessageAt: msg.timestamp,
          });
        }
      });

      return Array.from(conversationMap.values());
    } catch (error) {
      console.error('Erro em getConversations:', error.message, 'Stack:', error.stack);
      throw new Error('Falha ao buscar conversas');
    }
  }

  async markAsRead(messageId: string, userId: string) {
    try {
      console.log('Marcando mensagem como lida:', { messageId, userId });
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error(`Usuário com ID ${userId} não encontrado`);
      }

      return await this.prisma.chatMessage.updateMany({
        where: {
          id: messageId,
          receiverId: userId,
        },
        data: {
          isRead: true,
        },
      });
    } catch (error) {
      console.error('Erro em markAsRead:', error.message, 'Stack:', error.stack);
      throw new Error('Falha ao marcar mensagem como lida');
    }
  }

  async markMessagesAsRead(userId: string, targetUserId?: string) {
    try {
      console.log('Marcando mensagens como lidas:', { userId, targetUserId });
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error(`Usuário com ID ${userId} não encontrado`);
      }

      let whereClause: Prisma.ChatMessageWhereInput = { receiverId: userId, isRead: false };
      if (targetUserId) {
        whereClause = {
          ...whereClause,
          OR: [
            { sender_id: targetUserId, receiverId: userId },
            { sender_id: userId, receiverId: targetUserId },
          ],
        };
      }

      const result = await this.prisma.chatMessage.updateMany({
        where: whereClause,
        data: {
          isRead: true,
        },
      });

      console.log('Mensagens marcadas como lidas:', result);
      return result;
    } catch (error) {
      console.error('Erro em markMessagesAsRead:', error.message, 'Stack:', error.stack);
      throw new Error('Falha ao marcar mensagens como lidas');
    }
  }

  async getLastMessages(userId: string) {
    try {
      console.log('Buscando últimas mensagens para userId:', userId);
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error(`Usuário com ID ${userId} não encontrado`);
      }

      const conversations = await this.prisma.chatMessage.findMany({
        where: {
          OR: [
            { sender_id: userId },
            { receiverId: userId },
          ],
        },
        select: {
          sender_id: true,
          receiverId: true,
          sender: {
            select: { id: true, name: true, email: true },
          },
          receiver: {
            select: { id: true, name: true, email: true },
          },
          message: true,
          timestamp: true,
        },
        orderBy: { timestamp: 'desc' },
      });

      const lastMessages = {};
      conversations.forEach(msg => {
        const otherUserId = msg.sender_id === userId ? msg.receiverId : msg.sender_id;
        if (otherUserId && !lastMessages[otherUserId]) {
          lastMessages[otherUserId] = {
            message: msg.message,
            timestamp: msg.timestamp,
            sender: msg.sender_id === userId ? msg.receiver : msg.sender,
          };
        }
      });

      return lastMessages;
    } catch (error) {
      console.error('Erro em getLastMessages:', error.message, 'Stack:', error.stack);
      throw new Error('Falha ao buscar últimas mensagens');
    }
  }

  async getUnreadCountByUser(userId: string, targetUserId: string) {
    try {
      console.log('Contando mensagens não lidas para userId:', userId, 'targetUserId:', targetUserId);
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error(`Usuário com ID ${userId} não encontrado`);
      }
      const count = await this.prisma.chatMessage.count({
        where: {
          sender_id: targetUserId,
          receiverId: userId,
          isRead: false,
        },
      });
      console.log('Contagem de não lidas por usuário:', count);
      return count;
    } catch (error) {
      console.error('Erro em getUnreadCountByUser:', error.message, 'Stack:', error.stack);
      throw new Error('Falha ao contar mensagens não lidas por usuário');
    }
  }

  private generateBotResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();

    if (message.includes('benefício') || message.includes('beneficio')) {
      return 'Você pode consultar seus benefícios na seção "Benefícios" do sistema. Lá você encontrará informações sobre plano de saúde, vale refeição, vale transporte e outros benefícios disponíveis.';
    }

    if (message.includes('férias') || message.includes('ferias')) {
      return 'Para solicitar férias, acesse a seção "Férias" no menu. Você pode verificar seus dias disponíveis e fazer uma nova solicitação. Lembre-se de que as férias precisam ser aprovadas pelo seu gestor.';
    }

    if (message.includes('salário') || message.includes('salario') || message.includes('pagamento')) {
      return 'Informações sobre salário e pagamentos podem ser consultadas na seção "Perfil" ou entre em contato com o departamento financeiro para esclarecimentos específicos.';
    }

    if (message.includes('treinamento') || message.includes('curso')) {
      return 'Você pode ver os treinamentos disponíveis na seção "Treinamentos". Lá você encontrará cursos internos e externos, e poderá se inscrever nos que são adequados ao seu perfil.';
    }

    if (message.includes('avaliação') || message.includes('desempenho')) {
      return 'As avaliações de desempenho são realizadas periodicamente. Você pode acompanhar suas avaliações na seção "Avaliação de Desempenho" e ver o feedback dos seus gestores.';
    }

    if (message.includes('contato') || message.includes('suporte') || message.includes('ajuda')) {
      return 'Para suporte adicional, você pode entrar em contato com o RH através do email rh@empresa.com ou ramal 2000. Estou aqui para ajudar com dúvidas básicas sobre o sistema.';
    }

    if (message.includes('olá') || message.includes('oi') || message.includes('bom dia') || message.includes('boa tarde') || message.includes('boa noite')) {
      return 'Olá! Sou o assistente virtual do RH. Como posso ajudá-lo hoje? Posso responder dúvidas sobre benefícios, férias, treinamentos, avaliações e outras questões relacionadas ao sistema.';
    }

    if (message.includes('obrigado') || message.includes('obrigada') || message.includes('valeu')) {
      return 'De nada! Fico feliz em ajudar. Se tiver mais alguma dúvida, é só perguntar. Estou sempre aqui para auxiliá-lo!';
    }

    return 'Obrigado pela sua mensagem! Posso ajudá-lo com informações sobre benefícios, férias, treinamentos, avaliações de desempenho e outras questões do RH. Para assuntos mais específicos, recomendo entrar em contato diretamente com o departamento de Recursos Humanos.';
  }
}