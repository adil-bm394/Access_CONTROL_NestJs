import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true; // If no roles are defined, allow access

    const request = context.switchToHttp().getRequest();
   // console.log('[Role.Guard]request ', request.user);
    const user = request.user;

    if (!user || !user.role) return false;

    return roles.includes(user.role);
  }
}
