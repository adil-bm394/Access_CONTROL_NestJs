import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { errorMessages, successMessages } from '../utils/messages/messages';
import {
  BaseResponse,
  ErrorResponse,
  GenerateTokenResponse,
  LoginUserResponse,
  UserResponse,
} from '../utils/interfaces/types';
import { statusCodes } from '../utils/statusCodes/statusCodes';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import * as crypto from 'crypto';
import { forgetPasswordDto } from './dto/forget.password.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  //CREATE USER
  async createUser(
    userData: SignupDto,
    roleId: number,
  ): Promise<UserResponse | BaseResponse | ErrorResponse> {
    try {
      const { email, password } = userData;

      const existingUser =
        await this.usersService.userRepository.findByEmail(email);

      if (existingUser) {
        return {
          status: statusCodes.BAD_REQUEST,
          success: false,
          message: errorMessages.USER_ALREADY_EXIST,
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString('hex');

      const role = await this.usersService.roleRepository.getRoleById(roleId);
      if (!role) {
        return {
          status: statusCodes.NOT_FOUND,
          success: false,
          message: errorMessages.ROLE_NOT_FOUND,
        };
      }
      const savedUser = await this.usersService.userRepository.createUser(
        {
          ...userData,
          password: hashedPassword,
        },
        role,
        verificationToken,
      );

      await this.mailService.sendVerificationEmail(email, verificationToken);
      savedUser.password = undefined;

      return {
        status: statusCodes.CREATED,
        success: true,
        message: successMessages.USER_CREATED,
        user: savedUser,
      };
    } catch (error) {
      console.log(
        `[Auth.Service] Error creating user: ${error.message} || ${error}`,
      );
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  // LOGIN USER
  async login(
    userData: LoginDto,
  ): Promise<BaseResponse | LoginUserResponse | ErrorResponse> {
    try {
      const { email, password } = userData;
      const user = await this.usersService.userRepository.findByEmail(email);
      if (!user) {
        return {
          status: statusCodes.NOT_FOUND,
          success: false,
          message: errorMessages.USER_NOT_FOUND,
        };
      }

      if (user.status === 'inactive') {
        return {
          status: statusCodes.UNAUTHORIZED,
          success: false,
          message: errorMessages.ACCOUNT_DEACTIVATED,
        };
      }
          if (!user.isVerified) {
            return {
              status: statusCodes.UNAUTHORIZED,
              success: false,
              message: errorMessages.EMAIL_NOT_VERIFIED,
            };
          }

      const isMatchedPassword = await bcrypt.compare(password, user.password);
      if (!isMatchedPassword) {
        return {
          status: statusCodes.UNAUTHORIZED,
          success: false,
          message: errorMessages.INVALID_CREDENTIAL,
        };
      }

      const accessToken = this.generateAccessToken(
        user.id,
        user.role.role_name,
      );

      const refreshToken = this.generateRefreshToken(user.id);

      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

      const JWT_REFRESH_EXPIRY =
        +this.configService.get<number>('JWT_REFRESH_EXPIRY');

      const refreshTokenExpiresAt = new Date(Date.now() + JWT_REFRESH_EXPIRY);

      await this.usersService.userRepository.saveRefreshToken(
        user.id,
        hashedRefreshToken,
        refreshTokenExpiresAt,
      );

      return {
        status: statusCodes.OK,
        success: true,
        message: successMessages.USER_LOGIN,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          accessToken,
          role: user.role.role_name,
          refreshToken,
        },
      };
    } catch (error) {
      console.log(`[Auth.Service] Error during login: ${error}`);
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  //  GENERATE  REFRESH TOKEN SERVICES
  async refreshAccessToken(
    refreshToken: string,
  ): Promise<BaseResponse | GenerateTokenResponse | ErrorResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.userRepository.findById(payload.id);
      const isRefreshTokenMatched = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );
      if (!user || !isRefreshTokenMatched) {
        return {
          status: statusCodes.UNAUTHORIZED,
          success: false,
          message: errorMessages.INVALID_REFRESH_TOKEN,
        };
      }

      const newAccessToken = this.generateAccessToken(
        user.id,
        user.role.role_name,
      );

      return {
        status: statusCodes.OK,
        success: true,
        message: successMessages.TOKEN_REFRESHED,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          accessToken: newAccessToken,
          role: user.role.role_name,
        },
      };
    } catch (error) {
      console.log(
        `[Auth.Service] Error refreshing token: ${error?.message || error}`,
      );
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  //GENERATE ACCESS TOKEN
  private generateAccessToken(userId: number, userRole: string): string {
    return this.jwtService.sign(
      { id: userId, role: userRole },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRY'),
      },
    );
  }

  // GENERATE REFRESH TOKEN
  private generateRefreshToken(userId: number): string {
    return this.jwtService.sign(
      { id: userId },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRY'),
      },
    );
  }

  //GENERATE PASSWORD RESET TOKEN
  async generatePasswordResetToken(
    userData: forgetPasswordDto,
  ): Promise<string> {
    const user = await this.usersService.userRepository.findByEmail(
      userData.email,
    );
    if (!user) {
      if (!user) {
        throw new NotFoundException(errorMessages.USER_NOT_FOUND);
      }
    }
    const token = crypto.randomBytes(32).toString('hex');
    await this.usersService.userRepository.saveResetToken(user, token);
    return token;
  }

  //RESET PASSWORD
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<BaseResponse | ErrorResponse> {
    try {
      const user =
        await this.usersService.userRepository.findUserByResetToken(token);

      if (!user || !user.resetToken) {
        return {
          status: statusCodes.NOT_FOUND,
          success: false,
          message: errorMessages.USER_NOT_FOUND,
        };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      user.resetToken = null;
      user.resetTokenExpiration = null;
      await this.usersService.userRepository.save(user);

      return {
        status: statusCodes.OK,
        success: true,
        message: successMessages.PASSWORD_RESET,
      };
    } catch (error) {
      console.log(`[Auth.Service] Error during Reset Password: ${error}`);
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  // VERIFY EMAIL
  async verifyMail(token: string): Promise<BaseResponse | ErrorResponse> {
    console.log('[Auth.Service] token:', token);
    try {
      const user =
        await this.usersService.userRepository.findUserByVerificationToken(
          token,
        );

      if (!user) {
        return {
          status: statusCodes.NOT_FOUND,
          success: false,
          message: errorMessages.INVALID_VERIFICATION_TOKEN,
        };
      }

      user.isVerified = true;
      user.verificationToken = null;
      await this.usersService.userRepository.save(user);

      return {
        status: statusCodes.OK,
        success: true,
        message: successMessages.EMAIL_VERIFIED_SUCCESSFULLY,
      };
    } catch (error) {
      console.error(`[Auth.Service] Error during verify email: ${error}`);
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }
}
