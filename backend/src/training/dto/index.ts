import { IsString, IsOptional, IsDateString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTrainingDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (typeof value === 'string' ? parseInt(value) : value))
  maxParticipants?: number;

  @IsEnum(['scheduled', 'in_progress', 'completed', 'canceled'])
  status: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => (typeof value === 'string' ? parseFloat(value) : value))
  progress?: number | null;

  @IsOptional()
  @IsString()
  instructorId?: string | null;
}

export class UpdateTrainingDto {
  @IsOptional()
  @IsString()
  name?: string;

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
  @IsNumber()
  @Transform(({ value }) => (typeof value === 'string' ? parseInt(value) : value))
  maxParticipants?: number;

  @IsOptional()
  @IsEnum(['scheduled', 'in_progress', 'completed', 'canceled'])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => (typeof value === 'string' ? parseFloat(value) : value))
  progress?: number | null;

  @IsOptional()
  @IsString()
  instructorId?: string | null;
}

export class UpdateProgressDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => (typeof value === 'string' ? parseFloat(value) : value))
  progress: number;
}

export class AddParticipantDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => (typeof value === 'string' ? parseFloat(value) : value))
  progress?: number;
}