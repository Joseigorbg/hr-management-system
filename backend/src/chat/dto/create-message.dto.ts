import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional, IsIn } from "class-validator";

export class CreateMessageDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  senderId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  recipientId?: string;

  @ApiProperty({ example: "Olá, como posso solicitar férias?" })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiProperty({ example: "user", enum: ["user", "bot", "system"] })
  @IsString()
  @IsOptional()
  @IsIn(["user", "bot", "system"])
  messageType?: string;
}


