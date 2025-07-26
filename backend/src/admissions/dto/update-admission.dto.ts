import { IsDateString, IsNumber, IsString, IsIn, IsOptional, Min, ValidateIf} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAdmissionDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsDateString()
  @IsOptional()
  hireDate?: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Salário deve ser um número válido' })
  @Min(0, { message: 'Salário deve ser maior ou igual a 0' })
  @IsOptional()
  salary?: number;

  @IsString()
  @IsIn(['CLT', 'PJ', 'Estágio'])
  @IsOptional()
  contractType?: string;

  @IsString()
  @IsOptional()
  positionId?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsIn(['active', 'vacation', 'inactive', 'terminated'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  benefits?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsDateString()
  @ValidateIf(o => o.status === 'terminated')
  terminationDate?: string;
  
  @IsString()
  @ValidateIf(o => o.status === 'terminated')
  terminationReason?: string;
}