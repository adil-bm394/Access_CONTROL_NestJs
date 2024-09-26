import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { errorMessages } from 'src/utils/messages/messages';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    console.log("OTke")
    const JWT_SECRET = this.config.get<string>('JWT_SECRET');

    const request: Request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) throw new ForbiddenException(errorMessages.TOKEN_MISSING);

    try {
      const payload = this.jwtService.verify(token, { secret: JWT_SECRET });
      request.user = payload;
      return true;
    } catch (error) {
      console.error('[Auth.guard]Token verification error:', error.message);
      throw new ForbiddenException(errorMessages.INVALID_TOKEN);
    }
  }
}
