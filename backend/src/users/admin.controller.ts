import { Controller, Post, Body, Get, UseGuards, Patch, Param } from '@nestjs/common';
import { AdminService } from './admin.service';
import {
  UserResponse,
  BaseResponse,
  ErrorResponse,
  UsersListResponse,
} from '../utils/interfaces/types';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { RolesEnum } from '../utils/enums/roles.enum';

@Controller({ path: 'admin', version: '1' })
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  //GET ALL USER - Admin only
  @Get('/getAllUser')
  @Roles(RolesEnum.Admin)
  findAll(): Promise<BaseResponse | UsersListResponse | ErrorResponse> {
    return this.adminService.findAll();
  }

  //GET USER BY ID - Admin only
  @Get(':id')
  @Roles(RolesEnum.Admin)
  findOne(
    @Param('id') id: number,
  ): Promise<BaseResponse | UserResponse | ErrorResponse> {
    return this.adminService.findOne(id);
  }

  // DEACTIVATE USER - Admin only
  @Patch('deactivate/:id')
  @Roles(RolesEnum.Admin)
  deactivateUser(
    @Param('id') userId: number,
  ): Promise<BaseResponse | ErrorResponse> {
    return this.adminService.deactivateUser(userId);
  }

  // ACTIVATE USER - Admin only
  @Patch('activate/:id')
  @Roles(RolesEnum.Admin)
  activateUser(
    @Param('id') userId: number,
  ): Promise<BaseResponse | ErrorResponse> {
    return this.adminService.activateUser(userId);
  }
}
