import type { UserInfoDto } from '@/api/dto/user.dto';
import { applyDevelopmentAccessOverride, normalizeUserRole } from '@/adapters/authAdapter';
import type { CommonCodeLookup } from '@/adapters/commonCodeAdapter';
import type { SystemUser, UserRole } from '@/types/domain';

const toNumericUserId = (identifier: string) => {
  const numericId = Number(identifier);
  if (Number.isFinite(numericId) && numericId > 0) return numericId;

  return identifier
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
};

const getBackendRoleCode = (dto: UserInfoDto) =>
  String(dto.role_code ?? dto.roleCode ?? dto.role ?? dto.auth_cd ?? dto.authCd ?? '');

export const adaptUserInfoDtoToSystemUser = (
  dto: UserInfoDto,
  lookup?: CommonCodeLookup,
): SystemUser => {
  const identifier = dto.userid ?? dto.userId ?? dto.user_id ?? dto.username ?? '';
  const username = dto.username ?? dto.userid ?? dto.userId ?? dto.user_id ?? '';
  const backendRoleCode = getBackendRoleCode(dto);
  const backendRoleName = dto.role_name ?? dto.roleName ?? dto.auth_name ?? dto.authName
    ?? lookup?.getLabelInGroup('G_USER_LEVEL', backendRoleCode, backendRoleCode);

  return applyDevelopmentAccessOverride({
    id: toNumericUserId(identifier),
    username,
    password: dto.password ?? dto.user_pw ?? dto.userPw ?? '',
    name: dto.name ?? dto.user_name ?? dto.userName ?? username,
    role: normalizeUserRole(backendRoleCode),
    empNo: dto.emp_no ?? dto.empNo,
    backendRoleCode,
    backendRoleName,
  });
};

const backendRoleByFrontendRole: Record<UserRole, string> = {
  ADMIN: 'ROLE_ADMIN',
  EXECUTIVE: 'ROLE_EXECUTIVE',
  ORGANIZATION_MANAGER: 'ROLE_ORGANIZATION_MANAGER',
  SHIFT_MANAGER: 'ROLE_SHIFT_MANAGER',
  GENERAL: 'ROLE_GENERAL',
};

export const adaptSystemUserToUserInfoDto = (user: SystemUser): UserInfoDto => ({
  user_id: user.username,
  password: user.password,
  emp_no: user.empNo ?? '00000000',
  user_name: user.name,
  role_code: user.backendRoleCode || backendRoleByFrontendRole[user.role],
  acc_stat_code: 'ACC01',
  etc: '',
});
