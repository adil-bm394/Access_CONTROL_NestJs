import { Controller, Get, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  BaseResponse,
  ErrorResponse,
  UsersListResponse,
} from 'src/utils/interfaces/types';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/utils/decorator/roles.decorator';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //GET ALL USER
  @Get()
  @Roles('ADMIN')
  findAll(): Promise<BaseResponse | UsersListResponse | ErrorResponse> {
    return this.usersService.findAll();
  }

}
