// src/chat/chat.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server; // Adicionado ! para indicar que será inicializado pelo NestJS

  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.connectedUsers.set(client.id, data.userId);
    client.join(`user_${data.userId}`);
    console.log(`User ${data.userId} joined room`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const message = await this.chatService.createMessage(createMessageDto);
      
      // Enviar mensagem para o destinatário se especificado
      if (createMessageDto.recipientId) {
        this.server
          .to(`user_${createMessageDto.recipientId}`)
          .emit('newMessage', message);
      }
      
      // Enviar confirmação para o remetente
      client.emit('messageConfirmed', message);
      
      return message;
    } catch (error: any) { // Adicionado : any para o tipo de erro
      client.emit('messageError', { error: error.message });
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { userId: string; targetUserId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.chatService.markMessagesAsRead(data.userId, data.targetUserId);
      client.emit('messageRead', { userId: data.userId, targetUserId: data.targetUserId });
    } catch (error: any) { // Adicionado : any para o tipo de erro
      client.emit('error', { error: error.message });
    }
  }

  // Método para enviar mensagens do bot
  async sendBotMessage(userId: string, message: string) {
    const botMessage = await this.chatService.createMessage({
      // senderId: null, // Removido, pois é opcional e pode ser undefined
      recipientId: userId,
      message,
      messageType: 'bot',
    });

    this.server.to(`user_${userId}`).emit('newMessage', botMessage);
    return botMessage;
  }
}