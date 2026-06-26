import { apiClient } from './client';
import type {
  UserInfoDto,
  UserInfoListResponseDto,
  UserInfoResponseDto,
} from './dto/user.dto';

export const userInfoApi = {
  insert(payload: UserInfoDto) {
    return apiClient<string>('/api/userinfo/insert', {
      method: 'POST',
      body: { newuserinfo: payload },
    });
  },

  async selectAll() {
    const response = await apiClient<UserInfoListResponseDto>('/api/userinfo/select');
    return response.userinfolist ?? response.userinfoflist ?? response.userInfoList ?? response.list ?? response.data ?? [];
  },

  async selectOne(userid: string) {
    const response = await apiClient<UserInfoResponseDto>(`/api/userinfo/select/${userid}`);
    return response.userinfo ?? response.userInfo ?? response.data ?? null;
  },

  modify(payload: UserInfoDto) {
    return apiClient<string>('/api/userinfo/modify', {
      method: 'POST',
      body: { userinfo: payload },
    });
  },

  delete(userid: string) {
    return apiClient<string>(`/api/userinfo/delete/${userid}`, {
      method: 'POST',
    });
  },
};

