import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  UserResponse,
  LoginUserResponse,
  ErrorResponse,
  BaseResponse,
} from '../utils/interfaces/types';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //User SignUp
  @Post('/userSignup')
  async userSignUp(
    @Body() userData: SignupDto,
  ): Promise<UserResponse | BaseResponse | ErrorResponse> {
    return this.authService.create(userData,2);
  }

  //Admin SignUp
  @Post('/adminSignup')
  async adminSignUp(
    @Body() userData: SignupDto,
  ): Promise<UserResponse | BaseResponse | ErrorResponse> {
    return this.authService.create(userData,1);
  }

  @Post('/login')
  async login(
    @Body() loginData: LoginDto,
  ): Promise<BaseResponse | LoginUserResponse | ErrorResponse> {
    return this.authService.login(loginData);
  }
}
