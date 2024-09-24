import { IsEmail, IsNotEmpty} from 'class-validator';

export class forgetPasswordDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'please enter correct email' })
  readonly email: string;
}
