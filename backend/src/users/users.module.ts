import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './repository/users.repository';
import { RoleRepository } from './repository/role.repository';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository]),
    
    forwardRef(() => AuthModule),
  ],

  controllers: [UsersController],
  providers: [UsersService, UserRepository, RoleRepository],
  exports: [UsersService, UserRepository, RoleRepository],
})
export class UsersModule {}
