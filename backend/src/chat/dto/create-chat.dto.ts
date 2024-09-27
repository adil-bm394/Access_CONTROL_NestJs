import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateChatDto {
  @IsOptional()
  @IsInt()
  readonly groupId?: number;

  @IsNotEmpty({ message: 'Message cannot be empty' })
  @IsString()
  readonly message: string;

  @IsNotEmpty()
  @IsInt()
  readonly receiverId: number;
}
