import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginUserResponse,
  ErrorResponse,
  BaseResponse,
  UserResponse,
  GenerateTokenResponse,
} from '../utils/interfaces/types';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller({ path: 'auth', version: '1' })
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
    return this.authService.createUser(userData, adminRoleId);
  }

  //User SignUp
  @Post('/userSignup')
  async userSignUp(
    @Body() userData: SignupDto,
  ): Promise<UserResponse | BaseResponse | ErrorResponse> {
    const userRoleId = +this.configService.get<number>('USER_ROLE');
    return this.authService.createUser(userData, userRoleId);
  }

  //USER LOGIN
  @Post('/login')
  async login(
    @Body() loginData: LoginDto,
  ): Promise<BaseResponse | LoginUserResponse | ErrorResponse> {
    return this.authService.login(loginData);
  }

  //REFRESH TOKEN
  @Post('/refresh-token')
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<BaseResponse | GenerateTokenResponse | ErrorResponse> {
    return this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
  }
}
