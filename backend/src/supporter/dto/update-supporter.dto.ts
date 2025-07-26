// src/supporter/dto/update-supporter.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateSupporterDto {
  @ApiProperty({ example: 'João Silva', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: '(99) 99999-9999', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Rua das Flores, 123, Macapá, AP', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '68900000', required: false })
  @IsString()
  @IsOptional()
  cep?: string;

  @ApiProperty({ example: 'Zona Norte', required: false })
  @IsString()
  @IsOptional()
  mapping?: string;

  @ApiProperty({ example: 'people', required: false })
  @IsString()
  @IsOptional()
  supportType?: string;

  @ApiProperty({ example: 'active', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 0.0349, required: false })
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiProperty({ example: -51.0694, required: false })
  @IsNumber()
  @IsOptional()
  lng?: number;
}