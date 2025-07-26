import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadDocumentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reportId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;
}