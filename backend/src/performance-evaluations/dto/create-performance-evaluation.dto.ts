import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';

enum EvaluationStatus {
  pending = 'pending',
  completed = 'completed',
  approved = 'approved',
}

export class CreatePerformanceEvaluationDto {
  @IsString()
  @IsNotEmpty()
  userId: string; // Remova @IsUUID() se os IDs não são sempre UUIDs

  @IsString()
  @IsNotEmpty()
  evaluatorId: string; // Remova @IsUUID() se os IDs não são sempre UUIDs

  @IsString()
  @IsNotEmpty()
  period: string;

  @IsNumber()
  @IsNotEmpty()
  score: number;

  @IsString()
  @IsOptional()
  goals?: string;

  @IsString()
  @IsOptional()
  achievements?: string;

  @IsString()
  @IsOptional()
  feedback?: string;

  @IsEnum(EvaluationStatus)
  @IsNotEmpty()
  status: EvaluationStatus;
}