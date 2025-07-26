import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreatePositionDto {
  @ApiProperty({
    description: 'Nome do cargo',
    example: 'Desenvolvedor Full Stack',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Descrição do cargo',
    example: 'Responsável pelo desenvolvimento de aplicações web',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Salário do cargo em reais',
    example: 8000.0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  salary?: number;

  @ApiProperty({
    description: 'Status do cargo',
    example: 'Ativo',
    required: false,
  })
  @IsString()
  @IsOptional()
  status?: string;
}