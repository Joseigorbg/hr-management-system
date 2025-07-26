"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const chat_service_1 = require("./chat.service");
const create_message_dto_1 = require("./dto/create-message.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
let ChatController = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async createMessage(createMessageDto, userId) {
        console.log('Criando mensagem para userId:', userId, 'DTO:', createMessageDto);
        if (!createMessageDto.senderId) {
            createMessageDto.senderId = userId;
        }
        const message = await this.chatService.createMessage(createMessageDto);
        return { data: message };
    }
    async getMessages(userId, page, limit, userIdQuery, targetUserId) {
        console.log('Buscando mensagens para userId:', userId, 'page:', page, 'limit:', limit, 'userIdQuery:', userIdQuery, 'targetUserId:', targetUserId);
        const pageNum = page && !isNaN(parseInt(page)) ? parseInt(page) : 1;
        const limitNum = limit && !isNaN(parseInt(limit)) ? parseInt(limit) : 50;
        const effectiveUserId = userIdQuery || userId;
        const messages = await this.chatService.getMessages(effectiveUserId, pageNum, limitNum, targetUserId);
        return { data: messages };
    }
    async getConversations(userId) {
        console.log('Buscando conversas para userId:', userId);
        const conversations = await this.chatService.getConversations(userId);
        return { data: conversations };
    }
    async markAsRead(messageId, userId) {
        console.log('Marcando mensagem como lida:', { messageId, userId });
        const result = await this.chatService.markAsRead(messageId, userId);
        return { data: result };
    }
    async markAllAsRead(targetUserId, userId) {
        console.log('Marcando todas as mensagens como lidas para userId:', userId, 'targetUserId:', targetUserId);
        const result = await this.chatService.markMessagesAsRead(userId, targetUserId);
        return { data: result };
    }
    async getUnreadCount(userId) {
        try {
            console.log('Buscando contagem de não lidas para userId:', userId);
            const count = await this.chatService.getUnreadCount(userId);
            console.log('Contagem retornada:', count);
            return { data: count };
        }
        catch (error) {
            console.error('Erro em getUnreadCount:', error.message, 'Stack:', error.stack);
            throw new Error(`Falha ao obter contagem de mensagens não lidas: ${error.message}`);
        }
    }
    async getLastMessages(userId) {
        console.log('Buscando últimas mensagens para userId:', userId);
        const lastMessages = await this.chatService.getLastMessages(userId);
        return { data: lastMessages };
    }
    async getUnreadCountByUser(userId, targetUserId) {
        try {
            console.log('Buscando contagem de não lidas para userId:', userId, 'targetUserId:', targetUserId);
            const count = await this.chatService.getUnreadCountByUser(userId, targetUserId);
            console.log('Contagem retornada:', count);
            return { data: count };
        }
        catch (error) {
            console.error('Erro em getUnreadCountByUser:', error.message, 'Stack:', error.stack);
            throw new Error(`Falha ao obter contagem de mensagens não lidas por usuário: ${error.message}`);
        }
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Post)('messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar nova mensagem' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Mensagem enviada com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_message_dto_1.CreateMessageDto, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createMessage", null);
__decorate([
    (0, common_1.Get)('messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter mensagens do usuário' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'targetUserId', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de mensagens' }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('userId')),
    __param(4, (0, common_1.Query)('targetUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Get)('conversations'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter conversas do usuário' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de conversas' }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Patch)('messages/:id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar mensagem como lida' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mensagem marcada como lida' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Post)('mark-read'),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar todas as mensagens de um usuário como lidas' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mensagens marcadas como lidas' }),
    __param(0, (0, common_1.Body)('targetUserId')),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter contagem de mensagens não lidas' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contagem de mensagens não lidas' }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)('last-messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter últimas mensagens das conversas' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de últimas mensagens por conversa' }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getLastMessages", null);
__decorate([
    (0, common_1.Get)('unread-count-by-user'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter contagem de mensagens não lidas por usuário' }),
    (0, swagger_1.ApiQuery)({ name: 'targetUserId', required: true, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contagem de mensagens não lidas por usuário' }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Query)('targetUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUnreadCountByUser", null);
exports.ChatController = ChatController = __decorate([
    (0, swagger_1.ApiTags)('Chat'),
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map