import { IsNotEmpty, IsString, IsInt, ValidateIf, IsNumber } from 'class-validator';

export class CreateChatDto {
  @ValidateIf((o) => !o.receiverId) // Only validate if receiverId is not provided
  @IsNotEmpty()
  @IsInt()
  @IsNumber()
  readonly groupId?: number;

  @ValidateIf((o) => !o.groupId) // Only validate if groupId is not provided
  @IsNotEmpty()
  @IsInt()
  @IsNumber()
  readonly receiverId?: number;

  @IsNotEmpty()
  @IsString()
  readonly message: string;
}
