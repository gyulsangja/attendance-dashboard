'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { dashboardRepository } from '@/repositories/dashboardRepository';

const enabled = (year: number, month: number, week: number) => Boolean(year && month && week);

export const useDashboardWeeklyQuery = (year: number, month: number, week: number) =>
  useQuery({
    queryKey: queryKeys.dashboardWeekly(year, month, week),
    queryFn: () => dashboardRepository.getWeekly({ year, month, week }),
    enabled: enabled(year, month, week),
    retry: false,
  });

export const useDashboardWeeklySummaryQuery = (year: number, month: number, week: number) =>
  useQuery({
    queryKey: queryKeys.dashboardBlock('summary', year, month, week),
    queryFn: () => dashboardRepository.getWeeklySummary({ year, month, week }),
    enabled: enabled(year, month, week),
    retry: false,
  });

export const useDashboardWeeklyAttendanceCodeCountsQuery = (year: number, month: number, week: number) =>
  useQuery({
    queryKey: queryKeys.dashboardBlock('attendance-codes', year, month, week),
    queryFn: () => dashboardRepository.getWeeklyAttendanceCodeCounts({ year, month, week }),
    enabled: enabled(year, month, week),
    retry: false,
  });

export const useDashboardWeeklyExceptionalRecordsQuery = (year: number, month: number, week: number) =>
  useQuery({
    queryKey: queryKeys.dashboardBlock('exceptional-records', year, month, week),
    queryFn: () => dashboardRepository.getWeeklyExceptionalRecords({ year, month, week }),
    enabled: enabled(year, month, week),
    retry: false,
  });

export const useDashboardWeeklyPlansQuery = (year: number, month: number, week: number) =>
  useQuery({
    queryKey: queryKeys.dashboardBlock('plans', year, month, week),
    queryFn: () => dashboardRepository.getWeeklyPlans({ year, month, week }),
    enabled: enabled(year, month, week),
    retry: false,
  });

export const useDashboardWeeklyShiftSchedulesQuery = (year: number, month: number, week: number) =>
  useQuery({
    queryKey: queryKeys.dashboardBlock('shift-schedules', year, month, week),
    queryFn: () => dashboardRepository.getWeeklyShiftSchedules({ year, month, week }),
    enabled: enabled(year, month, week),
    retry: false,
  });
