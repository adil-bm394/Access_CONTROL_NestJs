import { Chat } from 'src/chat/entity/chat.entity';
import { User } from 'src/users/entities/user.entity';
import 'socket.io';
export interface BaseResponse {
  status: number;
  success: boolean;
  message: string;
}

export interface UserResponse extends BaseResponse {
  user: User;
}

export interface ErrorResponse extends BaseResponse {
  error: string;
}

export interface UsersListResponse extends BaseResponse {
  users: User[];
}

export interface LoginUserResponse extends BaseResponse {
  user: {
    id: number;
    username: string;
    email: string;
    accessToken: string;
    role: string;
    refreshToken: string;
  };
}

export interface GenerateTokenResponse extends BaseResponse {
  user: {
    id: number;
    username: string;
    email: string;
    accessToken: string;
    role: string;
  };
}
export interface forgetPasswordResponse extends BaseResponse {
  resetToken: string;
}

export interface ChatResponse extends BaseResponse {
  chat: string; 
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}



declare module 'socket.io' {
  interface Socket {
    user?: {
      id: number; 
      username?: string; 
    };
  }
}
