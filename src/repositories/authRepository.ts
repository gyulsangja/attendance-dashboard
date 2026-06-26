import { authApi } from '@/api/authApi';
import { tokenStorage } from '@/api/tokenStorage';
import { userInfoApi } from '@/api/userInfoApi';
import {
  adaptLoginUser,
  getAccessTokenFromLoginResponse,
} from '@/adapters/authAdapter';
import { adaptUserInfoDtoToSystemUser } from '@/adapters/userAdapter';
import { systemUsers } from '@/mocks';
import type { SystemUser } from '@/types/domain';
import { isApiDataSource } from './config';

export type LoginResult = {
  user: SystemUser;
  accessToken?: string;
};

export type AuthRepository = {
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
};

const mockAuthRepository: AuthRepository = {
  async login(username, password) {
    const user = systemUsers.find(
      (item) => item.username === username.trim() && item.password === password,
    );
    if (!user) throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
    return { user };
  },

  async logout() {
    tokenStorage.clearAccessToken();
  },
};

const apiAuthRepository: AuthRepository = {
  async login(username, password) {
    const response = await authApi.login({
      userid: username.trim(),
      username: username.trim(),
      password,
    });
    const accessToken = getAccessTokenFromLoginResponse(response);
    if (accessToken) tokenStorage.setAccessToken(accessToken);

    let user = adaptLoginUser(response, username.trim());
    try {
      const userInfo = await userInfoApi.selectOne(username.trim());
      if (userInfo) user = adaptUserInfoDtoToSystemUser(userInfo);
    } catch {
      // 로그인 API가 토큰만 반환하면 사용자 조회 실패 시 최소 세션으로 진입한다.
    }

    if (accessToken) tokenStorage.setSession(user, accessToken);

    return {
      user,
      accessToken,
    };
  },

  async logout() {
    try {
      await authApi.logout();
    } finally {
      tokenStorage.clearAccessToken();
    }
  },
};

export const authRepository = isApiDataSource
  ? apiAuthRepository
  : mockAuthRepository;
