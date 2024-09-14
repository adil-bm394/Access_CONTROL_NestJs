import {
  Injectable,
} from '@nestjs/common';
import { messages } from '../utils/messages/messages';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BaseResponse,
  ErrorResponse,
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

      //console.log('User.Service] Users:',users);

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
}