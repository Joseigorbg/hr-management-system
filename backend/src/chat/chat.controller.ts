// src/chat/chat.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('messages')
  @ApiOperation({ summary: 'Enviar nova mensagem' })
  @ApiResponse({ status: 201, description: 'Mensagem enviada com sucesso' })
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @GetUser('id') userId: string,
  ) {
    console.log('Criando mensagem para userId:', userId, 'DTO:', createMessageDto);
    if (!createMessageDto.senderId) {
      createMessageDto.senderId = userId;
    }
    const message = await this.chatService.createMessage(createMessageDto);
    return { data: message };
  }

  @Get('messages')
  @ApiOperation({ summary: 'Obter mensagens do usuário' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'targetUserId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de mensagens' })
  async getMessages(
    @GetUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userIdQuery?: string,
    @Query('targetUserId') targetUserId?: string,
  ) {
    console.log('Buscando mensagens para userId:', userId, 'page:', page, 'limit:', limit, 'userIdQuery:', userIdQuery, 'targetUserId:', targetUserId);
    const pageNum = page && !isNaN(parseInt(page)) ? parseInt(page) : 1;
    const limitNum = limit && !isNaN(parseInt(limit)) ? parseInt(limit) : 50;
    const effectiveUserId = userIdQuery || userId; // Usa userIdQuery se fornecido, senão o userId autenticado
    const messages = await this.chatService.getMessages(effectiveUserId, pageNum, limitNum, targetUserId);
    return { data: messages };
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Obter conversas do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de conversas' })
  async getConversations(@GetUser('id') userId: string) {
    console.log('Buscando conversas para userId:', userId);
    const conversations = await this.chatService.getConversations(userId);
    return { data: conversations };
  }

  @Patch('messages/:id/read')
  @ApiOperation({ summary: 'Marcar mensagem como lida' })
  @ApiResponse({ status: 200, description: 'Mensagem marcada como lida' })
  async markAsRead(
    @Param('id') messageId: string,
    @GetUser('id') userId: string,
  ) {
    console.log('Marcando mensagem como lida:', { messageId, userId });
    const result = await this.chatService.markAsRead(messageId, userId);
    return { data: result };
  }

  @Post('mark-read')
  @ApiOperation({ summary: 'Marcar todas as mensagens de um usuário como lidas' })
  @ApiResponse({ status: 200, description: 'Mensagens marcadas como lidas' })
  async markAllAsRead(
    @Body('targetUserId') targetUserId: string,
    @GetUser('id') userId: string,
  ) {
    console.log('Marcando todas as mensagens como lidas para userId:', userId, 'targetUserId:', targetUserId);
    const result = await this.chatService.markMessagesAsRead(userId, targetUserId); // Using existing method name
    return { data: result };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Obter contagem de mensagens não lidas' })
  @ApiResponse({ status: 200, description: 'Contagem de mensagens não lidas' })
  async getUnreadCount(@GetUser('id') userId: string) {
    try {
      console.log('Buscando contagem de não lidas para userId:', userId);
      const count = await this.chatService.getUnreadCount(userId);
      console.log('Contagem retornada:', count);
      return { data: count };
    } catch (error) {
      console.error('Erro em getUnreadCount:', error.message, 'Stack:', error.stack);
      throw new Error(`Falha ao obter contagem de mensagens não lidas: ${error.message}`);
    }
  }

  @Get('last-messages')
  @ApiOperation({ summary: 'Obter últimas mensagens das conversas' })
  @ApiResponse({ status: 200, description: 'Lista de últimas mensagens por conversa' })
  async getLastMessages(@GetUser('id') userId: string) {
    console.log('Buscando últimas mensagens para userId:', userId);
    const lastMessages = await this.chatService.getLastMessages(userId);
    return { data: lastMessages };
  }

  @Get('unread-count-by-user')
  @ApiOperation({ summary: 'Obter contagem de mensagens não lidas por usuário' })
  @ApiQuery({ name: 'targetUserId', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Contagem de mensagens não lidas por usuário' })
  async getUnreadCountByUser(
    @GetUser('id') userId: string,
    @Query('targetUserId') targetUserId: string,
  ) {
    try {
      console.log('Buscando contagem de não lidas para userId:', userId, 'targetUserId:', targetUserId);
      const count = await this.chatService.getUnreadCountByUser(userId, targetUserId);
      console.log('Contagem retornada:', count);
      return { data: count };
    } catch (error) {
      console.error('Erro em getUnreadCountByUser:', error.message, 'Stack:', error.stack);
      throw new Error(`Falha ao obter contagem de mensagens não lidas por usuário: ${error.message}`);
    }
  }
}