import { apiClient } from './client';
import type { LoginRequestDto, LoginResponseDto } from './dto/auth.dto';

export const authApi = {
  login(payload: LoginRequestDto) {
    return apiClient<LoginResponseDto>('/api/login', {
      method: 'POST',
      body: {
        logininfo: {
          userid: payload.userid ?? payload.username,
          password: payload.password,
        },
      },
      auth: false,
    });
  },

  logout() {
    return apiClient<string>('/api/logout', {
      method: 'POST',
    });
  },
};
