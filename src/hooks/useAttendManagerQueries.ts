'use client';

import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { adaptShiftScheduleToAttendManagerDto } from '@/adapters/attendManagerAdapter';
import { queryKeys } from '@/lib/queryKeys';
import { attendManagerRepository } from '@/repositories/attendManagerRepository';
import type { ShiftSchedule } from '@/types/domain';
import { invalidateAttendManagerQueries } from './useQueryInvalidation';

export const useAttendManagerSummaryQuery = (
  year: number,
  month: number,
  week: number,
  enabled = true,
) =>
  useQuery({
    queryKey: queryKeys.attendManagerSummary(year, month, week),
    queryFn: () => attendManagerRepository.getSummary({ year, month, week }),
    enabled: enabled && Boolean(year && month && week),
    retry: false,
  });

export const useAttendManagerOperationConfirmStatusQuery = (
  year: number,
  month: number,
  week: number,
  enabled = true,
) =>
  useQuery({
    queryKey: queryKeys.attendManagerOperationConfirmStatus(year, month, week),
    queryFn: () =>
      attendManagerRepository.getOperationConfirmStatus({ year, month, week }),
    enabled: enabled && Boolean(year && month && week),
    retry: false,
  });

export const useAttendManagerOperationConfirmStatusListQuery = (
  year: number,
  month: number,
  enabled = true,
) =>
  useQuery({
    queryKey: queryKeys.attendManagerOperationConfirmStatusList(year, month),
    queryFn: () =>
      attendManagerRepository.getOperationConfirmStatusList({ year, month, week: 1 }),
    enabled: enabled && Boolean(year && month),
    retry: false,
  });

export const useAttendManagerShiftMonthQuery = (
  year: number,
  month: number,
  week: number,
  enabled = true,
) =>
  useQuery({
    queryKey: queryKeys.attendManagerShiftMonth(year, month, week),
    queryFn: () => attendManagerRepository.getShiftMonth({ year, month, week }),
    enabled: enabled && Boolean(year && month && week),
    retry: false,
  });
export const useAttendManagerShiftMonthWeeksQuery = (
  year: number,
  month: number,
  weeks: Array<{ week: number; startDate?: string; endDate?: string }>,
  enabled = true,
) => {
  const getLegacyWeekByDate = (dateKey: string) => {
    const [targetYear, targetMonth, targetDay] = dateKey.split('-').map(Number);
    const lastDay = new Date(targetYear, targetMonth, 0).getDate();
    let currentDay = 1;
    let week = 1;

    while (currentDay <= lastDay) {
      const currentDate = new Date(targetYear, targetMonth - 1, currentDay);
      const endDay = Math.min(currentDay + (6 - currentDate.getDay()), lastDay);

      if (targetDay >= currentDay && targetDay <= endDay) {
        return { year: targetYear, month: targetMonth, week };
      }

      currentDay = endDay + 1;
      week += 1;
    }

    return { year: targetYear, month: targetMonth, week: 1 };
  };

  const queryTargets = [
    ...new Map(
      weeks
        .flatMap((item) => {
          const targets = [{ year, month, week: item.week }];
          const startMonth = item.startDate ? Number(item.startDate.slice(5, 7)) : month;
          const endMonth = item.endDate ? Number(item.endDate.slice(5, 7)) : month;

          if (item.startDate && startMonth !== month) {
            targets.push(getLegacyWeekByDate(item.startDate));
          }
          if (item.endDate && endMonth !== month) {
            targets.push(getLegacyWeekByDate(item.endDate));
          }

          return targets;
        })
        .map((item) => [`${item.year}-${item.month}-${item.week}`, item]),
    ).values(),
  ];

  const results = useQueries({
    queries: queryTargets.map((item) => ({
      queryKey: queryKeys.attendManagerShiftMonth(item.year, item.month, item.week),
      queryFn: () => attendManagerRepository.getShiftMonth({
        year: item.year,
        month: item.month,
        week: item.week,
      }),
      enabled: enabled && Boolean(item.year && item.month && item.week),
      retry: false,
    })),
  });

  return {
    data: results.flatMap((result) => result.data ?? []),
    isError: results.some((result) => result.isError),
    isLoading: results.some((result) => result.isLoading),
  };
};

export const useSaveAttendManagerShiftsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shifts: ShiftSchedule[]) =>
      attendManagerRepository.saveShift(shifts.map(adaptShiftScheduleToAttendManagerDto)),
    onSuccess: () => invalidateAttendManagerQueries(queryClient),
  });
};

export const useModifyAttendManagerShiftMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shift: ShiftSchedule) =>
      attendManagerRepository.modifyShift(adaptShiftScheduleToAttendManagerDto(shift)),
    onSuccess: () => invalidateAttendManagerQueries(queryClient),
  });
};

export const useDeleteAttendManagerShiftMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shiftScheduleId: number | string) =>
      attendManagerRepository.deleteShift(shiftScheduleId),
    onSuccess: () => invalidateAttendManagerQueries(queryClient),
  });
};

export const useConfirmAttendManagerOperationWeekMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { year: number; month: number; week: number }) =>
      attendManagerRepository.confirmOperationWeek(params),
    onSuccess: () => invalidateAttendManagerQueries(queryClient),
  });
};

export const useCancelAttendManagerOperationWeekMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { year: number; month: number; week: number }) =>
      attendManagerRepository.cancelOperationWeek(params),
    onSuccess: () => invalidateAttendManagerQueries(queryClient),
  });
};


