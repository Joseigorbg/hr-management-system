import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { EvaluationStatus } from '../entities/performance-evaluation.entity';

export class UpdatePerformanceEvaluationDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  evaluatorId?: string;

  @IsString()
  @IsOptional()
  period?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  score?: number;

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
  @IsOptional()
  status?: EvaluationStatus;
}