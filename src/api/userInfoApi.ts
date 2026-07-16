import { apiClient } from './client';
import type {
  UserInfoDto,
  UserInfoListResponseDto,
  UserInfoResponseDto,
} from './dto/user.dto';

const toTrimmedString = (value: unknown) => String(value ?? '').trim();

const normalizeUserInfoPayload = (payload: UserInfoDto): UserInfoDto => ({
  user_id: toTrimmedString(payload.user_id ?? payload.userid ?? payload.userId ?? payload.username),
  password: toTrimmedString(payload.password ?? payload.user_pw ?? payload.userPw),
  emp_no: toTrimmedString(payload.emp_no ?? payload.empNo),
  user_name: toTrimmedString(payload.user_name ?? payload.userName ?? payload.name),
  role_code: toTrimmedString(payload.role_code ?? payload.roleCode ?? payload.auth_cd ?? payload.authCd ?? payload.role),
  acct_stat_code: toTrimmedString(payload.acct_stat_code ?? payload.acc_stat_code ?? 'ACC01'),
  etc: toTrimmedString(payload.etc),
});

export const userInfoApi = {
  insert(payload: UserInfoDto) {
    return apiClient<string>('/api/userinfo/insert', {
      method: 'POST',
      body: { newuserinfo: normalizeUserInfoPayload(payload) },
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
      body: { userinfo: normalizeUserInfoPayload(payload) },
    });
  },

  delete(userid: string) {
    return apiClient<string>(`/api/userinfo/delete/${userid}`, {
      method: 'POST',
    });
  },
};

