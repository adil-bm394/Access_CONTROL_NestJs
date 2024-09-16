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
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  //Admin SignUp
  @Post('/adminSignup')
  async adminSignUp(
    @Body() userData: SignupDto,
  ): Promise<UserResponse | BaseResponse | ErrorResponse> {
   const adminRoleId = +this.configService.get<number>('ADMIN');
   //console.log('adminRoleId', adminRoleId);
    return this.authService.createAdmin(userData, adminRoleId);
  }

  //User SignUp
  @Post('/userSignup')
  async userSignUp(
    @Body() userData: SignupDto,
  ): Promise<UserResponse | BaseResponse | ErrorResponse> {
     const userRoleId = +this.configService.get<number>('USER_ROLE');
      //console.log('userRoleId', (userRoleId));
    return this.authService.createUser(userData,userRoleId);
  }

  @Post('/login')
  async login(
    @Body() loginData: LoginDto,
  ): Promise<BaseResponse | LoginUserResponse | ErrorResponse> {
    return this.authService.login(loginData);
  }
}
