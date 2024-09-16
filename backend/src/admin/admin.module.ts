import { forwardRef, Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserRepository } from 'src/users/repository/users.repository';
import { RoleRepository } from 'src/users/repository/role.repository';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
  ],
  controllers: [AdminController],
  providers: [AdminService, UserRepository, RoleRepository],
})
export class AdminModule {}
