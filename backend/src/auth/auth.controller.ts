import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginUserResponse,
  ErrorResponse,
  BaseResponse,
  UserResponse,
  GenerateTokenResponse,
  forgetPasswordResponse,
} from '../utils/interfaces/types';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { statusCodes } from 'src/utils/statusCodes/statusCodes';
import { errorMessages, successMessages } from 'src/utils/messages/messages';
import { MailService } from 'src/mail/mail.service';
import { forgetPasswordDto } from './dto/forget.password.dto';
import { UsersService } from 'src/users/users.service';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private usersService: UsersService,
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

  //FORGET PASSWORD
  @Post('forget-password')
  async forgotPassword(
    @Body() userData: forgetPasswordDto,
  ): Promise<BaseResponse | forgetPasswordResponse> {
    try {
      const user = await this.usersService.userRepository.findByEmail(
        userData.email,
      );
      if (!user) {
        return {
          status: statusCodes.NOT_FOUND,
          success: false,
          message: errorMessages.USER_NOT_FOUND,
        };
      }

      const token = await this.authService.generatePasswordResetToken(userData);
      await this.mailService.sendPasswordResetEmail(userData.email, token);

      return {
        status: statusCodes.OK,
        success: true,
        message: successMessages.RESET_EMAIL,
        resetToken: token,
      };
    } catch (error) {
      console.log(`[Auth.Controller] Error in while forget Password: ${error}`);
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
      };
    }
  }

  //RESET PASSWORD
  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    const { token, newPassword } = body;
    return await this.authService.resetPassword(token, newPassword);
  }

  //verify Email
  @Post('verify-email')
  async verifyEmail(@Query('token') token: string) {
    console.log('[Auth.Controller] token:', token);
    return await this.authService.verifyMail(token);
  }
}
