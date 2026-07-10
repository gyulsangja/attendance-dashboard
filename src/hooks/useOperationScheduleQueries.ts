'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { operationScheduleRepository } from '@/repositories/operationScheduleRepository';
import type { OperationSchedule } from '@/types/domain';
import { invalidateAttendManagerQueries } from './useQueryInvalidation';

export const useOperationSchedulesQuery = (
  startDate: string,
  endDate: string,
  params?: { year?: number; month?: number; week?: number },
) =>
  useQuery({
    queryKey: queryKeys.operationSchedules(
      startDate,
      endDate,
      params?.year,
      params?.month,
      params?.week,
    ),
    queryFn: () => operationScheduleRepository.selectByPeriod(startDate, endDate, params),
    enabled: Boolean(startDate && endDate),
  });

export const useInsertOperationSchedulesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schedules: OperationSchedule[]) =>
      operationScheduleRepository.insertMany(schedules),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['operation-schedules'],
      });
      invalidateAttendManagerQueries(queryClient);
    },
  });
};

export const useModifyOperationScheduleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schedule: OperationSchedule) =>
      operationScheduleRepository.modify(schedule),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['operation-schedules'],
      });
      invalidateAttendManagerQueries(queryClient);
    },
  });
};

export const useDeleteOperationScheduleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schedule: OperationSchedule) =>
      operationScheduleRepository.delete(schedule),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['operation-schedules'],
      });
      invalidateAttendManagerQueries(queryClient);
    },
  });
};
