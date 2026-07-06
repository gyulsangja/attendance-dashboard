'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adaptShiftScheduleToAttendManagerDto } from '@/adapters/attendManagerAdapter';
import { queryKeys } from '@/lib/queryKeys';
import { attendManagerRepository } from '@/repositories/attendManagerRepository';
import type { ShiftSchedule } from '@/types/domain';
import { invalidateAttendManagerQueries } from './useQueryInvalidation';

export const useAttendManagerSummaryQuery = (
  year: number,
  month: number,
  week: number,
) =>
  useQuery({
    queryKey: queryKeys.attendManagerSummary(year, month, week),
    queryFn: () => attendManagerRepository.getSummary({ year, month, week }),
    enabled: Boolean(year && month && week),
    retry: false,
  });

export const useAttendManagerOperationConfirmStatusQuery = (
  year: number,
  month: number,
  week: number,
) =>
  useQuery({
    queryKey: queryKeys.attendManagerOperationConfirmStatus(year, month, week),
    queryFn: () =>
      attendManagerRepository.getOperationConfirmStatus({ year, month, week }),
    enabled: Boolean(year && month && week),
    retry: false,
  });

export const useAttendManagerShiftConfirmStatusQuery = (
  year: number,
  month: number,
  week: number,
) =>
  useQuery({
    queryKey: queryKeys.attendManagerShiftConfirmStatus(year, month, week),
    queryFn: () => attendManagerRepository.getShiftConfirmStatus({ year, month, week }),
    enabled: Boolean(year && month && week),
    retry: false,
  });

export const useAttendManagerShiftMonthQuery = (year: number, month: number) =>
  useQuery({
    queryKey: queryKeys.attendManagerShiftMonth(year, month),
    queryFn: () => attendManagerRepository.getShiftMonth({ year, month }),
    enabled: Boolean(year && month),
    retry: false,
  });

export const useSaveAttendManagerShiftsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shifts: ShiftSchedule[]) =>
      attendManagerRepository.saveShift(shifts.map(adaptShiftScheduleToAttendManagerDto)),
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

export const useConfirmAttendManagerShiftWeekMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { year: number; month: number; week: number }) =>
      attendManagerRepository.confirmShiftWeek(params),
    onSuccess: () => invalidateAttendManagerQueries(queryClient),
  });
};

export const useCancelAttendManagerShiftWeekMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { year: number; month: number; week: number }) =>
      attendManagerRepository.cancelShiftWeek(params),
    onSuccess: () => invalidateAttendManagerQueries(queryClient),
  });
};
