import { Controller, Get, Body, Param, Req, UseGuards, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  BaseResponse,
  ErrorResponse,
  UserResponse,
  UsersListResponse,
} from 'src/utils/interfaces/types';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { SignupDto } from 'src/auth/dto/signup.dto';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

}
