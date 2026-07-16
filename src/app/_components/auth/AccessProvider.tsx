'use client';

import { useEffect, useMemo } from 'react';
import { tokenStorage } from '@/api/tokenStorage';
import { userRoles } from '@/constants/roles';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setApiSession } from '@/store/slices/authSlice';

export type { UserRole } from '@/types/domain';

export function AccessProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { currentUserId } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (currentUserId) return;

    const accessToken = tokenStorage.getAccessToken();
    const user = tokenStorage.getSessionUser();
    if (accessToken && user) dispatch(setApiSession({ user, accessToken }));
  }, [currentUserId, dispatch]);

  return children;
}

export function useAccess() {
  const { users, currentUserId } = useAppSelector((state) => state.auth);
  const storedCurrentUser = users.find((user) => user.id === currentUserId) ?? null;
  const currentUser = storedCurrentUser;
  const role = currentUser?.role ?? 'GENERAL';

  return useMemo(() => {
    const config = userRoles.find((item) => item.id === role) ?? userRoles[0];
    return {
      role,
      currentUser,
      isAuthenticated: Boolean(currentUser),
      roleLabel: currentUser?.backendRoleName ?? config.label,
      canViewDashboard: config.canViewDashboard,
      canViewReports: config.canViewReports,
      canManageOperations: config.canManageOperations,
      canManageOrganization: config.canManageOrganization,
      canManageSettings: config.canManageSettings,
      canInputShifts: config.canInputShifts,
      canManageUsers: config.canManageUsers,
    };
  }, [currentUser, role]);
}


