import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    createMessage(createMessageDto: CreateMessageDto, userId: string): Promise<{
        data: {
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
        };
    }>;
    getMessages(userId: string, page?: string, limit?: string, userIdQuery?: string, targetUserId?: string): Promise<{
        data: {
            id: string;
            sender_id: string;
            receiverId: string;
            message: string;
            isBot: boolean;
            timestamp: Date;
            sender: {
                id: string;
                name: string;
                profile: {
                    photoUrl: string;
                };
            };
            receiver: {
                id: string;
                name: string;
                profile: {
                    photoUrl: string;
                };
            };
        }[];
    }>;
    getConversations(userId: string): Promise<{
        data: any[];
    }>;
    markAsRead(messageId: string, userId: string): Promise<{
        data: import(".prisma/client").Prisma.BatchPayload;
    }>;
    markAllAsRead(targetUserId: string, userId: string): Promise<{
        data: import(".prisma/client").Prisma.BatchPayload;
    }>;
    getUnreadCount(userId: string): Promise<{
        data: number;
    }>;
    getLastMessages(userId: string): Promise<{
        data: {};
    }>;
    getUnreadCountByUser(userId: string, targetUserId: string): Promise<{
        data: number;
    }>;
}
