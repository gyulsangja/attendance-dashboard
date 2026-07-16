import type { LoginResponseDto } from '@/api/dto/auth.dto';
import { getFrontendRoleFromBackendCode } from '@/constants/roles';
import type { SystemUser, UserRole } from '@/types/domain';

const frontendRoles = new Set<UserRole>([
  'ADMIN',
  'EXECUTIVE',
  'SHIFT_MANAGER',
  'ORGANIZATION_MANAGER',
  'GENERAL',
]);

export const normalizeUserRole = (role?: UserRole | string): UserRole => {
  if (!role) return 'GENERAL';

  const normalized = String(role).trim().toUpperCase();
  if (frontendRoles.has(normalized as UserRole)) return normalized as UserRole;

  return getFrontendRoleFromBackendCode(normalized);
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
  const roleCode = response.role ?? response.auth_cd ?? response.authCd;

  return {
    id: toNumericUserId(identifier),
    username,
    password: '',
    name,
    role: normalizeUserRole(roleCode),
    backendRoleCode: roleCode,
  };
};
