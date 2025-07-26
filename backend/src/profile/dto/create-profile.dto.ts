import { IsString, IsOptional, IsDateString, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProfileDto {
  @ApiProperty({ description: "ID do usuário" })
  @IsUUID()
  userId!: string;

  @ApiProperty({ description: "Endereço", required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: "Telefone", required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: "Data de nascimento", required: false })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({ description: "Documento (CPF, RG, etc.)", required: false })
  @IsOptional()
  @IsString()
  document?: string;

  @ApiProperty({ description: "Contato de emergência (JSON)", required: false })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiProperty({ description: "URL da foto de perfil", required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: "Biografia", required: false })
  @IsOptional()
  @IsString()
  bio?: string;
}


