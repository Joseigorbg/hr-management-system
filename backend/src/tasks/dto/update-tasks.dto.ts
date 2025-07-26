import { IsOptional, IsString, IsBoolean, IsDateString, ValidateIf } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.groupId, { message: 'A tarefa só pode ser atribuída a um usuário ou grupo, não ambos.' })
  userId?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.userId, { message: 'A tarefa só pode ser atribuída a um usuário ou grupo, não ambos.' })
  groupId?: string;

  @IsOptional()
  @IsString()
  taskId?: string;
}