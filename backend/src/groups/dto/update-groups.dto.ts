import { IsString, IsNotEmpty } from 'class-validator';

export class AddUserToGroupDto {
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}