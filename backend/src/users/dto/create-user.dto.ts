import { IsString, IsOptional, MinLength, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Role {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

export class CreateUserDto {
  @ApiProperty({ example: 'Carlos Lima', required: true })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Silva', required: false })
  @IsString()
  @IsOptional()
  surname?: string;

  @ApiProperty({ example: 'carlos.lima@company.com', required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', required: false })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiProperty({ example: 'employee', enum: Role, required: true })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ example: 'p1q2r3s4-t5u6-v7w8-x9y0-z1a2b3c4d5e6', required: false })
  @IsString()
  @IsOptional()
  positionId?: string;

  @ApiProperty({ example: 'd2e3f4g5-i6j7-k8l9-m0n1-o2p3q4r5s6t7', required: false })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiProperty({ example: '2025-06-27', required: false })
  @IsString()
  @IsOptional()
  hireDate?: string;

  @ApiProperty({ example: 'CLT', required: false })
  @IsString()
  @IsOptional()
  contractType?: string;

  @ApiProperty({ example: 1500, required: false })
  @IsOptional()
  salary?: number;

  @ApiProperty({ example: 'active', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: '{"vale_refeicao": 500}', required: false })
  @IsOptional()
  benefits?: string;
}