import { Injectable } from '@nestjs/common';
import { messages } from '../utils/messages/messages';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BaseResponse,
  ErrorResponse,
  UserResponse,
  UsersListResponse,
} from '../utils/interfaces/types';
import { statusCodes } from '../utils/statusCodes/statusCodes';
import { UserRepository } from './repository/users.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  // GET ALL USERS
  async findAll(): Promise<BaseResponse | UsersListResponse | ErrorResponse> {
    try {
      const users = await this.userRepository.findAllUsers();

      users.forEach((user) => {
        user.password = undefined;
      });

      return {
        status: statusCodes.OK,
        success: true,
        message: messages.USER_FETCHED,
        users,
      };
    } catch (error) {
      console.log(`[Users.Service] Error in fetching All Users: ${error}`);
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  // GET USER BY ID
  async findOne(
    id: number,
  ): Promise<UserResponse | BaseResponse | ErrorResponse> {
    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        return {
          status: statusCodes.NOT_FOUND,
          success: false,
          message: messages.USER_NOT_FOUND,
        };
      }

      user.password = undefined;
      return {
        status: statusCodes.OK,
        success: true,
        message: messages.USER_FETCHED,
        user: user,
      };
    } catch (error) {
      console.error(`[Users.Service] Error in fetching Users BY ID: ${error}`);
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  //DEACTIVATE THE USER - Admin only
  async deactivateUser(userId: number): Promise<BaseResponse | ErrorResponse> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return {
          status: statusCodes.NOT_FOUND,
          success: false,
          message: messages.USER_NOT_FOUND,
        };
      }

      user.status = 'inactive';
      await this.userRepository.save(user);

      return {
        status: statusCodes.OK,
        success: true,
        message: messages.USER_DEACTIVATED,
      };
    } catch (error) {
      console.log(`[Users.Service] Error in deactivating user: ${error}`);
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  //ACTIVATE THE USER - Admin only
  async activateUser(userId: number): Promise<BaseResponse | ErrorResponse> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return {
          status: statusCodes.NOT_FOUND,
          success: false,
          message: messages.USER_NOT_FOUND,
        };
      }

      user.status = 'active';
      await this.userRepository.save(user);

      return {
        status: statusCodes.OK,
        success: true,
        message: messages.USER_ACTIVATED,
      };
    } catch (error) {
      console.log(`[Users.Service] Error in activating user: ${error}`);
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }
}
