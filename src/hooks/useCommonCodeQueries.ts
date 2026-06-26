'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CommonCode } from '@/adapters/commonCodeAdapter';
import { queryKeys } from '@/lib/queryKeys';
import { commonCodeRepository } from '@/repositories/commonCodeRepository';
import { invalidateCommonCodeQueries } from './useQueryInvalidation';

export const useCommonCodesQuery = () =>
  useQuery({
    queryKey: queryKeys.commonCodes,
    queryFn: () => commonCodeRepository.selectCodes(),
  });

export const useCommonGroupsQuery = () =>
  useQuery({
    queryKey: queryKeys.commonGroups,
    queryFn: () => commonCodeRepository.selectGroups(),
  });

export const useInsertCommonCodeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: CommonCode) => commonCodeRepository.insertCode(code),
    onSuccess: () => invalidateCommonCodeQueries(queryClient),
  });
};

export const useModifyCommonCodeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: CommonCode) => commonCodeRepository.modifyCode(code),
    onSuccess: () => invalidateCommonCodeQueries(queryClient),
  });
};

export const useDeleteCommonCodeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (detailCode: string) => commonCodeRepository.deleteCode(detailCode),
    onSuccess: () => invalidateCommonCodeQueries(queryClient),
  });
};
