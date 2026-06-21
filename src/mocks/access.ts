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
    description: '모든 메뉴와 회원 관리를 사용할 수 있습니다.',
    canViewDashboard: true,
    canViewReports: true,
    canManageOperations: true,
    canManageOrganization: true,
    canManageSettings: true,
    canInputShifts: true,
    canManageUsers: true,
  },
  {
    id: 'EXECUTIVE' as const,
    label: '경영진 조회',
    description: '대시보드와 현황통계만 조회할 수 있습니다.',
    canViewDashboard: true,
    canViewReports: true,
    canManageOperations: false,
    canManageOrganization: false,
    canManageSettings: false,
    canInputShifts: false,
    canManageUsers: false,
  },
  {
    id: 'SHIFT_MANAGER' as const,
    label: '교대근무 담당',
    description: '대시보드를 조회하고 교대근무 일정만 입력할 수 있습니다.',
    canViewDashboard: true,
    canViewReports: true,
    canManageOperations: false,
    canManageOrganization: false,
    canManageSettings: false,
    canInputShifts: true,
    canManageUsers: false,
  },
  {
    id: 'ORGANIZATION_MANAGER' as const,
    label: '조직관리 담당',
    description: '대시보드를 조회하고 직원·팀 관리와 운영관리 전체 기능을 사용할 수 있습니다.',
    canViewDashboard: true,
    canViewReports: true,
    canManageOperations: true,
    canManageOrganization: true,
    canManageSettings: false,
    canInputShifts: false,
    canManageUsers: false,
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
    canManageUsers: false,
  },
];
