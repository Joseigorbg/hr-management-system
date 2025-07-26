import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CreateDepartmentDto {
  @ApiProperty({ example: "Tecnologia da Informação" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "Departamento responsável pelo desenvolvimento e manutenção de sistemas", required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: "uuid-do-gerente", required: false })
  @IsString()
  @IsOptional()
  managerId?: string;
}


