import { IsString, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';

export class AssignTaskDto {
  @IsString()
  @IsNotEmpty()
  taskId: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.groupId, { message: 'A tarefa só pode ser atribuída a um usuário ou grupo, não ambos.' })
  userId?: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.userId, { message: 'A tarefa só pode ser atribuída a um usuário ou grupo, não ambos.' })
  groupId?: string;
}