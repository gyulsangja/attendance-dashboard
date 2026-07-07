import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { holidayRepository } from '@/repositories/holidayRepository';
import type { Holiday } from '@/types/domain';
import { invalidateHolidayQueries } from './useQueryInvalidation';

export const useHolidaysQuery = (year: number) =>
  useQuery({
    queryKey: queryKeys.holidays(year),
    queryFn: () => holidayRepository.selectByYear(year),
  });

export const useInsertHolidayMutation = (year: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (holiday: Holiday) => holidayRepository.insert(holiday),
    onSuccess: () => invalidateHolidayQueries(queryClient, year),
  });
};

export const useModifyHolidayMutation = (year: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (holiday: Holiday) => holidayRepository.modify(holiday),
    onSuccess: () => invalidateHolidayQueries(queryClient, year),
  });
};

export const useDeleteHolidayMutation = (year: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (holidayId: string) => holidayRepository.delete(holidayId),
    onSuccess: () => invalidateHolidayQueries(queryClient, year),
  });
};
