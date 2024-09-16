import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { messages } from 'src/utils/messages/messages';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true; // If no roles are defined, allow access

    const request = context.switchToHttp().getRequest();
    // console.log('[Role.Guard]request ', request.user);
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('User role is missing or invalid');
    }
    if (!roles.includes(user.role)) {
      throw new ForbiddenException(messages.PERMISSION_DENIED);
    }

    //return roles.includes(user.role);
    return true;
  }
}
