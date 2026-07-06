'use client';

import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';

export const invalidateCommonCodeQueries = (queryClient: QueryClient) => {
  void queryClient.invalidateQueries({ queryKey: queryKeys.commonCodes });
  void queryClient.invalidateQueries({ queryKey: queryKeys.commonGroups });
  void queryClient.invalidateQueries({ queryKey: queryKeys.attendanceCodes });
};

export const invalidateAttendanceCodeQueries = (queryClient: QueryClient) => {
  void queryClient.invalidateQueries({ queryKey: queryKeys.attendanceCodes });
  void queryClient.invalidateQueries({ queryKey: queryKeys.commonCodes });
};

export const invalidateAttendanceRecordQueries = (queryClient: QueryClient) => {
  void queryClient.invalidateQueries({ queryKey: queryKeys.attendanceRecordsBase });
};

export const invalidateEmployeeQueries = (queryClient: QueryClient) => {
  void queryClient.invalidateQueries({ queryKey: queryKeys.employees });
  void queryClient.invalidateQueries({ queryKey: queryKeys.organizationEmployees });
};

export const invalidateUserQueries = (queryClient: QueryClient) => {
  void queryClient.invalidateQueries({ queryKey: queryKeys.users });
};

export const invalidateWorkTimePolicyQueries = (queryClient: QueryClient) => {
  void queryClient.invalidateQueries({ queryKey: queryKeys.workTimePolicy });
};

export const invalidateAttendManagerQueries = (queryClient: QueryClient) => {
  void queryClient.invalidateQueries({ queryKey: ['attend-manager-summary'] });
  void queryClient.invalidateQueries({ queryKey: ['attend-manager-operation-confirm-status'] });
  void queryClient.invalidateQueries({ queryKey: ['attend-manager-shift-confirm-status'] });
  void queryClient.invalidateQueries({ queryKey: ['attend-manager-shift-month'] });
  void queryClient.invalidateQueries({ queryKey: ['dashboard-weekly'] });
  void queryClient.invalidateQueries({ queryKey: ['weekly-report'] });
  void queryClient.invalidateQueries({ queryKey: ['statistics-attendance'] });
  void queryClient.invalidateQueries({ queryKey: ['statistics-employee-attendance'] });
  void queryClient.invalidateQueries({ queryKey: ['statistics-attendance-records-monthly'] });
};
