'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { operationScheduleRepository } from '@/repositories/operationScheduleRepository';
import type { OperationSchedule } from '@/types/domain';

export const useOperationSchedulesQuery = (startDate: string, endDate: string) =>
  useQuery({
    queryKey: queryKeys.operationSchedules(startDate, endDate),
    queryFn: () => operationScheduleRepository.selectByPeriod(startDate, endDate),
    enabled: Boolean(startDate && endDate),
  });

export const useInsertOperationSchedulesMutation = (startDate: string, endDate: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schedules: OperationSchedule[]) =>
      operationScheduleRepository.insertMany(schedules),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.operationSchedules(startDate, endDate),
      });
    },
  });
};

export const useModifyOperationScheduleMutation = (startDate: string, endDate: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schedule: OperationSchedule) =>
      operationScheduleRepository.modify(schedule),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.operationSchedules(startDate, endDate),
      });
    },
  });
};
