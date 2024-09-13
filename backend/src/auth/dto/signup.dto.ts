import { IsEmail, IsNotEmpty, IsString, Length, IsEnum } from 'class-validator';

export class SignupDto {
  @IsNotEmpty()
  @IsString()
  @Length(4, 20)
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 60)
  password: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 255)
  address: string;
}