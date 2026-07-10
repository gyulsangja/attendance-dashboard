import type { RoleAccess, UserRole } from '@/types/domain';

export type { UserRole } from '@/types/domain';

export const initialUserRole: UserRole = 'ADMIN';

const fullAccess = {
  canViewDashboard: true,
  canViewReports: true,
  canManageOperations: true,
  canManageOrganization: true,
  canManageSettings: true,
  canInputShifts: true,
  canManageUsers: true,
};

export const userRoles: RoleAccess[] = [
  {
    id: 'ADMIN',
    label: '관리자',
    description: '모든 메뉴와 관리 기능을 사용할 수 있습니다.',
    ...fullAccess,
  },
  {
    id: 'EXECUTIVE',
    label: '경영진',
    description: '관리자와 동일하게 모든 메뉴와 관리 기능을 사용할 수 있습니다.',
    ...fullAccess,
  },
  {
    id: 'SHIFT_MANAGER',
    label: '교대근무 담당',
    description: '교대근무 일정을 입력, 수정, 삭제할 수 있습니다.',
    canViewDashboard: true,
    canViewReports: true,
    canManageOperations: false,
    canManageOrganization: false,
    canManageSettings: false,
    canInputShifts: true,
    canManageUsers: false,
  },
  {
    id: 'ORGANIZATION_MANAGER',
    label: '조직관리 담당',
    description: '관리자와 동일하게 모든 메뉴와 관리 기능을 사용할 수 있습니다.',
    ...fullAccess,
  },
  {
    id: 'GENERAL',
    label: '일반 사용자',
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
