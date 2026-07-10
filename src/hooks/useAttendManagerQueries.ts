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
  weeks: Array<{ week: number }>,
  enabled = true,
) => {
  const results = useQueries({
    queries: weeks.map((item) => ({
      queryKey: queryKeys.attendManagerShiftMonth(year, month, item.week),
      queryFn: () => attendManagerRepository.getShiftMonth({
        year,
        month,
        week: item.week,
      }),
      enabled: enabled && Boolean(year && month && item.week),
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


