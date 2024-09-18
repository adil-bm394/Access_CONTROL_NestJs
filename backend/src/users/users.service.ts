import { Injectable } from '@nestjs/common';
import { errorMessages, successMessages } from '../utils/messages/messages';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  BaseResponse,
  ErrorResponse,
  UserResponse,
} from '../utils/interfaces/types';
import { statusCodes } from '../utils/statusCodes/statusCodes';
import { UserRepository } from './repository/users.repository';
import { RoleRepository } from './repository/role.repository';
import { UpdateDto } from './dto/update.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    public readonly userRepository: UserRepository,
    @InjectRepository(RoleRepository)
    public readonly roleRepository: RoleRepository,
  ) {}

  // GET USER BY ID
  async findOne(
    id: number,
    currentUserId: number,
  ): Promise<UserResponse | BaseResponse | ErrorResponse> {
    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        return {
          status: statusCodes.NOT_FOUND,
          success: false,
          message: errorMessages.USER_NOT_FOUND,
        };
      }

      if (user.id !== currentUserId) {
        return {
          status: statusCodes.UNAUTHORIZED,
          success: false,
          message: errorMessages.ACCESS_NOT_ALLOWED,
        };
      }

      user.password = undefined;
      return {
        status: statusCodes.OK,
        success: true,
        message: successMessages.USER_FETCHED,
        user: user,
      };
    } catch (error) {
      console.log(`[Users.Service] Error in fetching Users BY ID: ${error}`);
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  //UPDATE USER
  async update(
    id: number,
    updatedData: UpdateDto,
    currentUserId: number,
  ): Promise<UserResponse | BaseResponse | ErrorResponse> {
    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        return {
          status: statusCodes.NOT_FOUND,
          success: false,
          message: errorMessages.USER_NOT_FOUND,
        };
      }

      if (user.id !== currentUserId) {
        return {
          status: statusCodes.UNAUTHORIZED,
          success: false,
          message: errorMessages.UPDATE_NOT_ALLOWED,
        };
      }

      await this.userRepository.updateUser(id, updatedData);

      const updatedUser = await this.userRepository.findById(id);
      updatedUser.password = undefined;
      return {
        status: statusCodes.OK,
        success: true,
        message: successMessages.USER_UPDATED,
        user: updatedUser,
      };
    } catch (error) {
      console.log(`[Users.Service] Error in Updating Users: ${error}`);
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  // DELETE USER (SOFT DELETE)
  async delete(
    id: number,
    currentUserId: number,
  ): Promise<BaseResponse | ErrorResponse> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        return {
          status: statusCodes.NOT_FOUND,
          success: false,
          message: errorMessages.USER_NOT_FOUND,
        };
      }

      if (user.id !== currentUserId) {
        return {
          status: statusCodes.UNAUTHORIZED,
          success: false,
          message: errorMessages.DELETE_NOT_ALLOWED,
        };
      }

      await this.userRepository.softDeleteUser(id);
      return {
        status: statusCodes.OK,
        success: true,
        message: successMessages.USER_DELETED,
      };
    } catch (error) {
      console.log(`[Users.Service] Error in Soft Delete Users: ${error}`);
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }
}
