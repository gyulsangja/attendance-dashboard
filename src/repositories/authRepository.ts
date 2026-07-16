import { authApi } from '@/api/authApi';
import { tokenStorage } from '@/api/tokenStorage';
import { userInfoApi } from '@/api/userInfoApi';
import {
  adaptLoginUser,
  getAccessTokenFromLoginResponse,
} from '@/adapters/authAdapter';
import { adaptUserInfoDtoToSystemUser } from '@/adapters/userAdapter';
import type { SystemUser } from '@/types/domain';

export type LoginResult = {
  user: SystemUser;
  accessToken?: string;
};

export type AuthRepository = {
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
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
      // 로그인 응답에 토큰만 있는 경우 최소 세션으로 진입한다.
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

export const authRepository = apiAuthRepository;
