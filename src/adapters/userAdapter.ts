import type { UserInfoDto } from '@/api/dto/user.dto';
import { applyDevelopmentAccessOverride, normalizeUserRole } from '@/adapters/authAdapter';
import type { SystemUser, UserRole } from '@/types/domain';

const toNumericUserId = (identifier: string) => {
  const numericId = Number(identifier);
  if (Number.isFinite(numericId) && numericId > 0) return numericId;

  return identifier
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
};

export const adaptUserInfoDtoToSystemUser = (dto: UserInfoDto): SystemUser => {
  const identifier = dto.userid ?? dto.userId ?? dto.user_id ?? dto.username ?? '';
  const username = dto.username ?? dto.userid ?? dto.userId ?? dto.user_id ?? '';

  return applyDevelopmentAccessOverride({
    id: toNumericUserId(identifier),
    username,
    password: dto.password ?? dto.user_pw ?? dto.userPw ?? '',
    name: dto.name ?? dto.user_name ?? dto.userName ?? username,
    role: normalizeUserRole(dto.role ?? dto.auth_cd ?? dto.authCd ?? dto.role_code ?? dto.roleCode),
    empNo: dto.emp_no ?? dto.empNo,
    backendRoleCode: String(dto.role_code ?? dto.roleCode ?? dto.role ?? ''),
  });
};

const backendRoleByFrontendRole: Record<UserRole, string> = {
  ADMIN: 'ROLE_SUPER',
  EXECUTIVE: 'ROLE_SUPER',
  ORGANIZATION_MANAGER: 'ROLE_SUPER',
  SHIFT_MANAGER: 'ROLE_USER',
  GENERAL: 'ROLE_USER',
};

export const adaptSystemUserToUserInfoDto = (user: SystemUser): UserInfoDto => ({
  user_id: user.username,
  password: user.password,
  emp_no: user.empNo ?? '00000000',
  user_name: user.name,
  role_code: backendRoleByFrontendRole[user.role],
  acc_stat_code: 'ACC01',
  etc: '',
});

