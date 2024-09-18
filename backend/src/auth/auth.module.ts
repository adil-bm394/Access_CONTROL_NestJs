import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserRepository } from '../users/repository/users.repository';
import { RoleRepository } from 'src/users/repository/role.repository';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string | number>('JWT_EXPIRY'),
        },
      }),
    }),
  ],
  providers: [AuthService, UserRepository, RoleRepository],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
