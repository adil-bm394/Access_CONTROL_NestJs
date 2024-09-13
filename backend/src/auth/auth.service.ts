import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { messages } from '../utils/messages/messages';
import {
  BaseResponse,
  ErrorResponse,
  LoginUserResponse,
  UserResponse,
} from '../utils/interfaces/types';
import { InjectRepository } from '@nestjs/typeorm';
import { statusCodes } from '../utils/statusCodes/statusCodes';
import { UserRepository } from 'src/users/repository/users.repository';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RoleRepository } from 'src/users/repository/role.repository';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(RoleRepository)
    private roleRepository: RoleRepository,
    private jwtService: JwtService,
  ) {}

  //CREATE USER | Admin
  async create(
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
          message: messages.USER_ALREADY_EXIST,
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const role = await this.roleRepository.getRoleById(roleId);
      if (!role) {
        return {
          status: statusCodes.NOT_FOUND,
          success: false,
          message: messages.ROLE_NOT_FOUND,
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
        message: messages.USER_CREATED,
        user: savedUser,
      };
    } catch (error) {
      console.log(
        `[Auth.Service] Error creating user: ${error.message} || ${error}`,
      );
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
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
          message: messages.USER_NOT_FOUND,
        };
      }

      const isMatchedPassword = await bcrypt.compare(password, user.password);
      if (!isMatchedPassword) {
        return {
          status: statusCodes.UNAUTHORIZED,
          success: false,
          message: messages.INVALID_CREDENTIAL,
        };
      }

      const token = this.jwtService.sign({ id: user.id });

      return {
        status: statusCodes.OK,
        success: true,
        message: messages.USER_LOGIN,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          token,
        },
      };
    } catch (error) {
      console.log(`[Auth.Service] Error during login: ${error}`);
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }
}
