import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddUserToGroupDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
