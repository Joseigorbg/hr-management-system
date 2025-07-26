import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSettingDto {
  @ApiProperty({ description: 'Chave da configuração' })
  @IsString()
  key: string;

  @ApiProperty({ description: 'Valor da configuração' })
  @IsString()
  value: string;

  @ApiProperty({ description: 'Descrição da configuração', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Categoria da configuração', required: false })
  @IsOptional()
  @IsString()
  category?: string;
}

