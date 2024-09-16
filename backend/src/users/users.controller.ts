import { Controller, Get, Body, Param, Req, UseGuards, Patch, Post, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  BaseResponse,
  ErrorResponse,
  UserResponse,
} from 'src/utils/interfaces/types';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UpdateDto } from './dto/update.dto';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET USER BY ID
  @Get(':id')
  findOne(
    @Param('id') id: number,
    @Req() req,
  ): Promise<UserResponse | BaseResponse | ErrorResponse> {
    const currentUserId = req.user.id;
    return this.usersService.findOne(id, currentUserId);
  }

  // UPDATE USER
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updatedData: UpdateDto,
    @Req() req,
  ): Promise<UserResponse | BaseResponse | ErrorResponse> {
    const currentUserId = req.user.id;
    return this.usersService.update(id, updatedData, currentUserId);
  }

  // DELETE USER
  @Delete(':id')
  remove(
    @Param('id') id: number,
    @Req() req,
  ): Promise<BaseResponse | ErrorResponse> {
    const currentUserId = req.user.id;
    return this.usersService.delete(id, currentUserId);
  }
}
