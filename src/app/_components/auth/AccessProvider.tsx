'use client';

import { useEffect, useMemo } from 'react';
import { tokenStorage } from '@/api/tokenStorage';
import { applyDevelopmentAccessOverride } from '@/adapters/authAdapter';
import { userRoles } from '@/mocks';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setApiSession } from '@/store/slices/authSlice';

export type { UserRole } from '@/mocks';

export function AccessProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { currentUserId } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (currentUserId) return;

    const accessToken = tokenStorage.getAccessToken();
    const user = tokenStorage.getSessionUser();
    if (accessToken && user) dispatch(setApiSession({ user: applyDevelopmentAccessOverride(user), accessToken }));
  }, [currentUserId, dispatch]);

  return children;
}

export function useAccess() {
  const { users, currentUserId } = useAppSelector((state) => state.auth);
  const storedCurrentUser = users.find((user) => user.id === currentUserId) ?? null;
  const currentUser = storedCurrentUser ? applyDevelopmentAccessOverride(storedCurrentUser) : null;
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
      canManageUsers: config.canManageUsers,
    };
  }, [currentUser, role]);
}


