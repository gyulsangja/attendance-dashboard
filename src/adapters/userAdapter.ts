import type { UserInfoDto } from '@/api/dto/user.dto';
import { normalizeUserRole } from '@/adapters/authAdapter';
import type { CommonCodeLookup } from '@/adapters/commonCodeAdapter';
import { getDefaultBackendRoleCode } from '@/constants/roles';
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

  return {
    id: toNumericUserId(identifier),
    username,
    password: dto.password ?? dto.user_pw ?? dto.userPw ?? '',
    name: dto.name ?? dto.user_name ?? dto.userName ?? username,
    role: normalizeUserRole(backendRoleCode),
    empNo: dto.emp_no ?? dto.empNo,
    backendRoleCode,
    backendRoleName,
  };
};

const backendRoleByFrontendRole: Record<UserRole, string> = {
  ADMIN: getDefaultBackendRoleCode('ADMIN'),
  EXECUTIVE: getDefaultBackendRoleCode('EXECUTIVE'),
  ORGANIZATION_MANAGER: getDefaultBackendRoleCode('ORGANIZATION_MANAGER'),
  SHIFT_MANAGER: getDefaultBackendRoleCode('SHIFT_MANAGER'),
  GENERAL: getDefaultBackendRoleCode('GENERAL'),
};

export const adaptSystemUserToUserInfoDto = (user: SystemUser): UserInfoDto => ({
  user_id: user.username.trim(),
  password: user.password.trim(),
  emp_no: user.empNo?.trim() ?? '',
  user_name: user.name.trim(),
  role_code: (user.backendRoleCode || backendRoleByFrontendRole[user.role]).trim(),
  acct_stat_code: 'ACC01',
  etc: '',
});
