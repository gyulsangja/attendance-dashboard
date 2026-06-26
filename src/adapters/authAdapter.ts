import type { LoginResponseDto } from '@/api/dto/auth.dto';
import type { SystemUser, UserRole } from '@/types/domain';

const fallbackRole: UserRole = 'GENERAL';
const roleAliases: Record<string, UserRole> = {
  ADMIN: 'ADMIN',
  ROLE_ADMIN: 'ADMIN',
  ROLE_SUPER: 'ADMIN',
  SUPER: 'ADMIN',
  EXECUTIVE: 'EXECUTIVE',
  ROLE_EXECUTIVE: 'EXECUTIVE',
  SHIFT_MANAGER: 'SHIFT_MANAGER',
  ROLE_SHIFT_MANAGER: 'SHIFT_MANAGER',
  ORGANIZATION_MANAGER: 'ORGANIZATION_MANAGER',
  ORG_MANAGER: 'ORGANIZATION_MANAGER',
  ROLE_ORGANIZATION_MANAGER: 'ORGANIZATION_MANAGER',
  GENERAL: 'GENERAL',
  ROLE_GENERAL: 'GENERAL',
  ROLE_USER: 'GENERAL',
};

const developmentAdminUsernames = new Set(['dev1']);

export const normalizeUserRole = (role?: UserRole | string): UserRole => {
  if (!role) return fallbackRole;
  return roleAliases[String(role).trim().toUpperCase()] ?? fallbackRole;
};

export const applyDevelopmentAccessOverride = (user: SystemUser): SystemUser => {
  if (!developmentAdminUsernames.has(user.username.trim().toLowerCase())) return user;

  return {
    ...user,
    role: 'ADMIN',
    backendRoleCode: user.backendRoleCode ?? 'DEV_FRONTEND_ADMIN_OVERRIDE',
  };
};

const toNumericUserId = (identifier: string) => {
  const numericId = Number(identifier);
  if (Number.isFinite(numericId) && numericId > 0) return numericId;

  return identifier
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
};

const getTokenFromEntryArray = (payload: unknown): string | undefined => {
  if (!Array.isArray(payload)) return undefined;

  for (const entry of payload) {
    if (!Array.isArray(entry)) continue;

    const tokenEntry = entry.find(
      (item): item is [string, string] =>
        Array.isArray(item) && item[0] === 'token' && typeof item[1] === 'string',
    );
    if (tokenEntry) return tokenEntry[1];
  }

  return undefined;
};

export const getAccessTokenFromLoginResponse = (response: LoginResponseDto) =>
  response.loginresult?.token
  ?? response['login result']?.token
  ?? getTokenFromEntryArray(response)
  ?? response.accessToken
  ?? response.token
  ?? response.jwt
  ?? '';

export const adaptLoginUser = (
  response: LoginResponseDto,
  fallbackUsername = '',
): SystemUser => {
  const identifier = response.userid ?? response.userId ?? response.username ?? fallbackUsername;
  const username = response.username ?? response.userid ?? response.userId ?? fallbackUsername;
  const name =
    response.name ??
    response.user_name ??
    response.userName ??
    response.username ??
    response.userid ??
    response.userId ??
    fallbackUsername ??
    '';

  return applyDevelopmentAccessOverride({
    id: toNumericUserId(identifier),
    username,
    password: '',
    name,
    role: normalizeUserRole(response.role ?? response.auth_cd ?? response.authCd),
  });
};
