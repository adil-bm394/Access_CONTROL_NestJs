import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDto {
  @IsNotEmpty()
  @IsString()
  readonly username: string;

  @IsNotEmpty()
  @IsString()
  readonly address: string;
}
