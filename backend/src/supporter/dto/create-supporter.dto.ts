// src/supporter/dto/create-supporter.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateSupporterDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  name: string;

  @ApiProperty({ example: '(99) 99999-9999' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Rua das Flores, 123, Macapá, AP' })
  @IsString()
  address: string;

  @ApiProperty({ example: '68900000' })
  @IsString()
  cep: string;

  @ApiProperty({ example: 'Zona Norte' })
  @IsString()
  mapping: string;

  @ApiProperty({ example: 'people' })
  @IsString()
  supportType: string;

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