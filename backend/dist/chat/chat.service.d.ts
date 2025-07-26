import { PrismaService } from '../common/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Prisma } from '@prisma/client';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    createMessage(createMessageDto: CreateMessageDto): Promise<{
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
    getMessages(userId: string, page?: number, limit?: number, targetUserId?: string): Promise<{
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
    }[]>;
    getUnreadCount(userId: string): Promise<number>;
    getConversations(userId: string): Promise<any[]>;
    markAsRead(messageId: string, userId: string): Promise<Prisma.BatchPayload>;
    markMessagesAsRead(userId: string, targetUserId?: string): Promise<Prisma.BatchPayload>;
    getLastMessages(userId: string): Promise<{}>;
    getUnreadCountByUser(userId: string, targetUserId: string): Promise<number>;
    private generateBotResponse;
}
