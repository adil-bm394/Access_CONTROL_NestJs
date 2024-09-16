import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './repository/users.repository';
import { RoleRepository } from './repository/role.repository';
import { AuthModule } from 'src/auth/auth.module';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository, RoleRepository]),

    forwardRef(() => AuthModule),
  ],

  controllers: [UsersController, AdminController],
  providers: [UsersService,AdminService, UserRepository, RoleRepository],
  exports: [UsersService, AdminService, UserRepository, RoleRepository],
})
export class UsersModule {}
