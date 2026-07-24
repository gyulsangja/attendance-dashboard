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
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['attend-manager-summary'] }),
    queryClient.invalidateQueries({ queryKey: ['attend-manager-operation-confirm-status'] }),
    queryClient.invalidateQueries({ queryKey: ['attend-manager-operation-confirm-status-list'] }),
    queryClient.invalidateQueries({ queryKey: ['attend-manager-shift-month'] }),
    queryClient.invalidateQueries({ queryKey: ['dashboard-weekly'] }),
    queryClient.invalidateQueries({ queryKey: ['dashboard-block'] }),
    queryClient.invalidateQueries({ queryKey: ['weekly-report'] }),
    queryClient.invalidateQueries({ queryKey: ['statistics-attendance'] }),
    queryClient.invalidateQueries({ queryKey: ['statistics-employee-attendance'] }),
    queryClient.invalidateQueries({ queryKey: ['statistics-attendance-records-monthly'] }),
  ]);
};

export const invalidateHolidayQueries = (queryClient: QueryClient, year?: number) => {
  if (year) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.holidays(year) });
    return;
  }

  void queryClient.invalidateQueries({ queryKey: ['holidays'] });
};

export const invalidateMailMessageQueries = (queryClient: QueryClient) => {
  void queryClient.invalidateQueries({ queryKey: queryKeys.mailMessages });
};
