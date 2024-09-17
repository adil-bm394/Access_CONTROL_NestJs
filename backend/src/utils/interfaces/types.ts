import { User } from "src/users/entities/user.entity";

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
    accessToken:string;
    refreshToken:string;
    role: string;
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

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
