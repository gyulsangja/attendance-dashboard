import type { RoleAccess, UserRole } from '@/types/domain';

export type BackendRoleCode =
  | 'ROLE_ADMIN'
  | 'ROLE_SUPER'
  | 'ROLE_EXECUTIVE'
  | 'ROLE_ORGANIZATION_MANAGER'
  | 'ROLE_SHIFT_MANAGER'
  | 'ROLE_USER'
  | 'ROLE_GUEST';

export type RoleAccessConfig = RoleAccess & {
  backendCodes: BackendRoleCode[];
};

export const initialUserRole: UserRole = 'ADMIN';

const fullAccessWithoutUserManagement = {
  canViewDashboard: true,
  canViewReports: true,
  canManageOperations: true,
  canManageOrganization: true,
  canManageSettings: true,
  canInputShifts: true,
  canManageUsers: false,
};

export const userRoles: RoleAccessConfig[] = [
  {
    id: 'ADMIN',
    backendCodes: ['ROLE_ADMIN', 'ROLE_SUPER'],
    label: '관리자',
    description: '모든 메뉴와 관리자 기능을 사용할 수 있습니다.',
    ...fullAccessWithoutUserManagement,
    canManageUsers: true,
  },
  {
    id: 'EXECUTIVE',
    backendCodes: ['ROLE_EXECUTIVE'],
    label: '임원',
    description: '회원관리를 제외한 주요 관리 기능을 사용할 수 있습니다.',
    ...fullAccessWithoutUserManagement,
  },
  {
    id: 'ORGANIZATION_MANAGER',
    backendCodes: ['ROLE_ORGANIZATION_MANAGER'],
    label: '조직관리자',
    description: '회원관리를 제외한 주요 관리 기능을 사용할 수 있습니다.',
    ...fullAccessWithoutUserManagement,
  },
  {
    id: 'SHIFT_MANAGER',
    backendCodes: ['ROLE_SHIFT_MANAGER'],
    label: '교대담당자',
    description: '교대근무 일정을 입력하고 관리할 수 있습니다.',
    canViewDashboard: true,
    canViewReports: true,
    canManageOperations: false,
    canManageOrganization: false,
    canManageSettings: false,
    canInputShifts: true,
    canManageUsers: false,
  },
  {
    id: 'GENERAL',
    backendCodes: ['ROLE_USER', 'ROLE_GUEST'],
    label: '일반사용자',
    description: '대시보드와 상세보기를 조회할 수 있습니다.',
    canViewDashboard: true,
    canViewReports: true,
    canManageOperations: false,
    canManageOrganization: false,
    canManageSettings: false,
    canInputShifts: false,
    canManageUsers: false,
  },
];

export const normalizeBackendRoleCode = (roleCode?: string) =>
  roleCode?.trim().toUpperCase() ?? '';

export const getFrontendRoleFromBackendCode = (roleCode?: string): UserRole => {
  const normalized = normalizeBackendRoleCode(roleCode);
  const role = userRoles.find((item) =>
    item.backendCodes.some((backendCode) => backendCode === normalized));

  return role?.id ?? 'GENERAL';
};

export const getDefaultBackendRoleCode = (role: UserRole): BackendRoleCode =>
  userRoles.find((item) => item.id === role)?.backendCodes[0] ?? 'ROLE_USER';
