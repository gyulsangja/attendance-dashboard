'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { settingsRepository } from '@/repositories/settingsRepository';
import type { WorkTimePolicy } from '@/types/domain';
import { invalidateWorkTimePolicyQueries } from './useQueryInvalidation';

export const useWorkTimePolicyQuery = () =>
  useQuery({
    queryKey: queryKeys.workTimePolicy,
    queryFn: () => settingsRepository.getWorkTimePolicy(),
  });

export const useUpdateWorkTimePolicyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (policy: WorkTimePolicy) => settingsRepository.updateWorkTimePolicy(policy),
    onSuccess: () => {
      invalidateWorkTimePolicyQueries(queryClient);
    },
  });
};

