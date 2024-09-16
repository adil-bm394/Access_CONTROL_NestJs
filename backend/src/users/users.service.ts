import { Injectable } from '@nestjs/common';
import { messages } from '../utils/messages/messages';
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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(RoleRepository)
    private roleRepository: RoleRepository,
  ) {}

  


}
