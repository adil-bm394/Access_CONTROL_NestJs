import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginUserResponse,
  ErrorResponse,
  BaseResponse,
  UserResponse,
} from '../utils/interfaces/types';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //Admin SignUp
  @Post('/adminSignup')
  async adminSignUp(
    @Body() userData: SignupDto,
  ): Promise<UserResponse | BaseResponse | ErrorResponse> {
    return this.authService.createAdmin(userData,1);
  }

  //User SignUp
  @Post('/userSignup')
  async userSignUp(
    @Body() userData: SignupDto,
  ): Promise<UserResponse | BaseResponse | ErrorResponse> {
    return this.authService.createUser(userData,2);
  }

  @Post('/login')
  async login(
    @Body() loginData: LoginDto,
  ): Promise<BaseResponse | LoginUserResponse | ErrorResponse> {
    return this.authService.login(loginData);
  }
}
