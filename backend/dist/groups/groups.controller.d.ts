import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-groups.dto';
import { AddUserToGroupDto } from './dto/add-user-to-group.dto';
export declare class GroupsController {
    private readonly groupsService;
    constructor(groupsService: GroupsService);
    findAll(): Promise<{
        data: {
            id: string;
            name: string;
            description: string;
            users: {
                id: string;
                name: string;
                email: string;
            }[];
        }[];
    }>;
    create(body: CreateGroupDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addUserToGroup(body: AddUserToGroupDto): Promise<{
        id: string;
        name: string;
        description: string;
        users: {
            id: string;
            name: string;
            email: string;
        }[];
    }>;
}
