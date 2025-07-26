import { IsString, IsNotEmpty, IsOptional, IsDateString, ValidateIf } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.groupId, { message: 'A tarefa só pode ser atribuída a um usuário ou grupo, não ambos.' })
  userId?: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.userId, { message: 'A tarefa só pode ser atribuída a um usuário ou grupo, não ambos.' })
  groupId?: string;
}