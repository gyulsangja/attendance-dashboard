'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { mailMessageRepository } from '@/repositories/mailMessageRepository';
import type { MailMessage } from '@/types/domain';
import { invalidateMailMessageQueries } from './useQueryInvalidation';

export const useMailMessagesQuery = () =>
  useQuery({
    queryKey: queryKeys.mailMessages,
    queryFn: () => mailMessageRepository.select(),
  });

export const useInsertMailMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: MailMessage) => mailMessageRepository.insert(message),
    onSuccess: () => invalidateMailMessageQueries(queryClient),
  });
};

export const useModifyMailMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: MailMessage) => mailMessageRepository.modify(message),
    onSuccess: () => invalidateMailMessageQueries(queryClient),
  });
};

export const useDeleteMailMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mailMessageRepository.delete(id),
    onSuccess: () => invalidateMailMessageQueries(queryClient),
  });
};
