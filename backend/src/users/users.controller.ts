import { Controller, Get, Body, Param, Req, UseGuards, Patch } from '@nestjs/common';
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

  //GET ALL USER - Admin only
  @Get()
  @Roles('ADMIN')
  findAll(): Promise<BaseResponse | UsersListResponse | ErrorResponse> {
    return this.usersService.findAll();
  }

  // DEACTIVATE USER - Admin only
  @Patch('deactivate/:id')
  @Roles('ADMIN') // This ensures only admins can deactivate users
  deactivateUser(
    @Param('id') userId: number,
  ): Promise<BaseResponse | ErrorResponse> {
    return this.usersService.deactivateUser(userId);
  }

  // ACTIVATE USER - Admin only
  @Patch('activate/:id')
  @Roles('ADMIN') // This ensures only admins can deactivate users
  activateUser(
    @Param('id') userId: number,
  ): Promise<BaseResponse | ErrorResponse> {
    return this.usersService.activateUser(userId);
  }
}
