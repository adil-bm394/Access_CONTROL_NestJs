import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateChatDto {

  @IsOptional()
  @IsInt()
  readonly groupId?: number;

  @IsNotEmpty()
  @IsString() 
  readonly message: string;
}
