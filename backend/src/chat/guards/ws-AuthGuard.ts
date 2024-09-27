import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { errorMessages } from 'src/utils/messages/messages';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const JWT_SECRET = this.config.get<string>('JWT_SECRET');
    const client = context.switchToWs().getClient();

    const token = client.handshake.headers['bearer'].toString();
    //console.log('[WsAuthGuard] Token:', token);

    if (!token) {
      throw new WsException(errorMessages.TOKEN_MISSING);
    }

    try {
      const payload = this.jwtService.verify(token, { secret: JWT_SECRET });
      client.user = payload;
      return true;
    } catch (error) {
      console.error('[WsAuthGuard] Token verification error:', error.message);
      throw new WsException(errorMessages.INVALID_TOKEN);
    }
  }
}

