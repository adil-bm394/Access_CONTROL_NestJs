import { Injectable } from '@nestjs/common';
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
import { InjectRepository } from '@nestjs/typeorm';
import { statusCodes } from '../utils/statusCodes/statusCodes';
import { UserRepository } from 'src/users/repository/users.repository';
import { LoginDto } from './dto/login.dto';
import { RoleRepository } from 'src/users/repository/role.repository';
import { SignupDto } from './dto/signup.dto';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
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
      );
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
          },
        };
      } catch (error) {
        console.log(`[Auth.Service] Error during login: ${error}`);
        return {
          status: 500,
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
}
