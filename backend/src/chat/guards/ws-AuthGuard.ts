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
    console.log(JWT_SECRET, "Fffff")
    const client = context.switchToWs().getClient();
    // console.log(client, 'ff');
    const token = this.extractTokenFromHeaders(client.handshake.headers);
    console.log('[WsAuthGuard] Token:', token);

    if (!token) {
      throw new WsException(errorMessages.TOKEN_MISSING);
    }

    try {
      const payload = this.jwtService.verify(token, { secret: JWT_SECRET });
      client.userId = payload.id;
      // console.log('[WsAuthGuard] Client userId:', client.userId);
      return true;
    } catch (error) {
      console.error('[WsAuthGuard] Token verification error:', error.message);
      throw new WsException(errorMessages.INVALID_TOKEN);
    }
  }

  private extractTokenFromHeaders(headers: any): string | null {
    return headers['authorization']?.split(' ')[1] || null;
  }
}

