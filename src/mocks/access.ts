export type UserRole =
  | 'ADMIN'
  | 'EXECUTIVE'
  | 'SHIFT_MANAGER'
  | 'ORGANIZATION_MANAGER'
  | 'GENERAL';

export const initialUserRole: UserRole = 'ADMIN';

export const userRoles = [
  {
    id: 'ADMIN' as const,
    label: '관리자',
    description: '모든 메뉴와 관리 기능을 사용할 수 있습니다.',
    canViewDashboard: true,
    canViewReports: true,
    canManageOperations: true,
    canManageOrganization: true,
    canManageSettings: true,
    canInputShifts: true,
    canApproveShifts: true,
    canManageUsers: true,
  },
  {
    id: 'EXECUTIVE' as const,
    label: '경영진',
    description: '관리자와 동일하게 모든 메뉴와 관리 기능을 사용할 수 있습니다.',
    canViewDashboard: true,
    canViewReports: true,
    canManageOperations: true,
    canManageOrganization: true,
    canManageSettings: true,
    canInputShifts: true,
    canApproveShifts: true,
    canManageUsers: true,
  },
  {
    id: 'SHIFT_MANAGER' as const,
    label: '교대근무 담당',
    description: '교대근무 일정을 입력·수정·삭제하고 주차별로 확정할 수 있습니다.',
    canViewDashboard: true,
    canViewReports: true,
    canManageOperations: false,
    canManageOrganization: false,
    canManageSettings: false,
    canInputShifts: true,
    canApproveShifts: true,
    canManageUsers: false,
  },
  {
    id: 'ORGANIZATION_MANAGER' as const,
    label: '조직관리 담당',
    description: '관리자와 동일하게 모든 메뉴와 관리 기능을 사용할 수 있습니다.',
    canViewDashboard: true,
    canViewReports: true,
    canManageOperations: true,
    canManageOrganization: true,
    canManageSettings: true,
    canInputShifts: true,
    canApproveShifts: true,
    canManageUsers: true,
  },
  {
    id: 'GENERAL' as const,
    label: '일반 사용자',
    description: '대시보드와 현황통계를 조회할 수 있습니다.',
    canViewDashboard: true,
    canViewReports: true,
    canManageOperations: false,
    canManageOrganization: false,
    canManageSettings: false,
    canInputShifts: false,
    canApproveShifts: false,
    canManageUsers: false,
  },
];
