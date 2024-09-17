import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { errorMessages, successMessages } from '../utils/messages/messages';
import {
  BaseResponse,
  ErrorResponse,
  LoginUserResponse,
  UserResponse,
} from '../utils/interfaces/types';
import { InjectRepository } from '@nestjs/typeorm';
import { statusCodes } from '../utils/statusCodes/statusCodes';
import { UserRepository } from 'src/users/repository/users.repository';
import { LoginDto } from './dto/login.dto';
import { RoleRepository } from 'src/users/repository/role.repository';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(RoleRepository)
    private roleRepository: RoleRepository,
    private jwtService: JwtService,
  ) {}

  // CREATE ADMIN
  async createAdmin(
    userData: SignupDto,
    roleId: number,
  ): Promise<UserResponse | BaseResponse | ErrorResponse> {
    try {
      const { email, password } = userData;

      const existingUser = await this.userRepository.findByEmail(email);

      if (existingUser) {
        return {
          status: statusCodes.BAD_REQUEST,
          success: false,
          message: errorMessages.USER_ALREADY_EXIST,
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const role = await this.roleRepository.getRoleById(roleId);
      if (!role) {
        return {
          status: statusCodes.NOT_FOUND,
          success: false,
          message: errorMessages.ROLE_NOT_FOUND,
        };
      }

      const savedUser = await this.userRepository.createUser(
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

  // CREATE USER
  async createUser(
    userData: SignupDto,
    roleId: number,
  ): Promise<UserResponse | BaseResponse | ErrorResponse> {
    try {
      const { email, password } = userData;

      const existingUser = await this.userRepository.findByEmail(email);

      if (existingUser) {
        return {
          status: statusCodes.BAD_REQUEST,
          success: false,
          message: errorMessages.USER_ALREADY_EXIST,
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const role = await this.roleRepository.getRoleById(roleId);
      if (!role) {
        return {
          status: statusCodes.NOT_FOUND,
          success: false,
          message: errorMessages.ROLE_NOT_FOUND,
        };
      }

      const savedUser = await this.userRepository.createUser(
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

  //LOGIN SERVICE
  async login(
    userData: LoginDto,
  ): Promise<BaseResponse | LoginUserResponse | ErrorResponse> {
    try {
      const { email, password } = userData;

      const user = await this.userRepository.findByEmail(email);
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

      const token = this.jwtService.sign({
        id: user.id,
        role: user.role.role_name,
      });

      return {
        status: statusCodes.OK,
        success: true,
        message: successMessages.USER_LOGIN,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          token,
          role: user.role.role_name,
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

  
}
