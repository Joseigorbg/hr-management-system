import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private chatService;
    server: Server;
    private connectedUsers;
    constructor(chatService: ChatService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoin(data: {
        userId: string;
    }, client: Socket): void;
    handleMessage(createMessageDto: CreateMessageDto, client: Socket): Promise<{
        sender: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        receiverId: string;
        message: string;
        timestamp: Date;
        isBot: boolean;
        isRead: boolean;
        messageType: string;
        sender_id: string;
    }>;
    handleMarkAsRead(data: {
        userId: string;
        targetUserId?: string;
    }, client: Socket): Promise<void>;
    sendBotMessage(userId: string, message: string): Promise<{
        sender: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        receiverId: string;
        message: string;
        timestamp: Date;
        isBot: boolean;
        isRead: boolean;
        messageType: string;
        sender_id: string;
    }>;
}
