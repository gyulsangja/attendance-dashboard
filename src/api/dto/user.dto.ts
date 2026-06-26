import type { UserRole } from '@/types/domain';

export type UserInfoDto = {
  userid?: string;
  userId?: string;
  user_id?: string;
  username?: string;
  password?: string;
  user_pw?: string;
  userPw?: string;
  emp_no?: string;
  empNo?: string;
  name?: string;
  user_name?: string;
  userName?: string;
  role?: UserRole | string;
  auth_cd?: UserRole | string;
  authCd?: UserRole | string;
  role_code?: UserRole | string;
  roleCode?: UserRole | string;
  acc_stat_code?: string;
  acct_stat_code?: string;
  use_yn?: string;
  useYn?: string;
  etc?: string;
};

export type UserInfoListResponseDto = {
  userinfoflist?: UserInfoDto[];
  userinfolist?: UserInfoDto[];
  userInfoList?: UserInfoDto[];
  list?: UserInfoDto[];
  data?: UserInfoDto[];
};

export type UserInfoResponseDto = {
  userinfo?: UserInfoDto;
  userInfo?: UserInfoDto;
  data?: UserInfoDto;
};

