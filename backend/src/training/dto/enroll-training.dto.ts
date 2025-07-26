import { IsUUID, IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnrollTrainingDto {
  @ApiProperty({ description: 'ID do usuário' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'ID do treinamento' })
  @IsUUID()
  trainingId: string;
}

export class CompleteTrainingDto {
  @ApiProperty({ description: 'Pontuação obtida', minimum: 0, maximum: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  score?: number;

  @ApiProperty({ description: 'URL do certificado', required: false })
  @IsOptional()
  @IsString()
  certificate?: string;
}

