'use client';

import { useMemo } from 'react';
import { userRoles } from '@/mocks';
import { useAppSelector } from '@/store/hooks';

export type { UserRole } from '@/mocks';

// 기존 레이아웃 구조를 유지하기 위한 얇은 래퍼입니다.
export function AccessProvider({ children }: { children: React.ReactNode }) {
  return children;
}

export function useAccess() {
  const { users, currentUserId } = useAppSelector((state) => state.auth);
  const currentUser = users.find((user) => user.id === currentUserId) ?? null;
  const role = currentUser?.role ?? 'EXECUTIVE';

  return useMemo(() => {
    const config = userRoles.find((item) => item.id === role) ?? userRoles[0];
    return {
      role,
      currentUser,
      isAuthenticated: Boolean(currentUser),
      roleLabel: config.label,
      canViewDashboard: config.canViewDashboard,
      canViewReports: config.canViewReports,
      canManageOperations: config.canManageOperations,
      canManageOrganization: config.canManageOrganization,
      canManageSettings: config.canManageSettings,
      canInputShifts: config.canInputShifts,
      canApproveShifts: config.canApproveShifts,
      canManageUsers: config.canManageUsers,
    };
  }, [currentUser, role]);
}
