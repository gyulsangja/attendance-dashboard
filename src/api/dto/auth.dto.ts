import type { UserRole } from '@/types/domain';

export type LoginRequestDto = {
  userid?: string;
  username?: string;
  password: string;
};

export type LoginResponseDto = {
  loginresult?: {
    status?: string;
    token?: string;
  };
  'login result'?: {
    status?: string;
    token?: string;
  };
  accessToken?: string;
  token?: string;
  jwt?: string;
  userid?: string;
  userId?: string;
  username?: string;
  user_name?: string;
  userName?: string;
  name?: string;
  role?: UserRole | string;
  auth_cd?: UserRole | string;
  authCd?: UserRole | string;
};
