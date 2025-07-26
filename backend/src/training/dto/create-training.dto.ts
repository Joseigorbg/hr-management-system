import { IsString, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTrainingDto {
  @ApiProperty({ description: 'Nome do treinamento' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Descrição do treinamento', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'ID do instrutor', required: false })
  @IsOptional()
  @IsString()
  instructorId?: string;

  @ApiProperty({ description: 'Data de início' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Data de fim' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'Máximo de participantes', minimum: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxParticipants?: number;

  @ApiProperty({ description: 'Status do treinamento', enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], default: 'scheduled' })
  @IsOptional()
  @IsString()
  status?: string;
}