export interface JwtPayload {
  email: string;
  sub: number;
  permission: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    permission: string;
  };
}
