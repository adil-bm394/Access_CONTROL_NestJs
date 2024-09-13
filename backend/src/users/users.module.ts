import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './repository/users.repository';
import { RoleRepository } from './repository/role.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository])],

  controllers: [UsersController],
  providers: [UsersService, UserRepository, RoleRepository],
  exports: [UsersService, UserRepository, RoleRepository],
})
export class UsersModule {}
