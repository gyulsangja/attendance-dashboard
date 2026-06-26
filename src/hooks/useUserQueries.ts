'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { userRepository } from '@/repositories/userRepository';
import type { SystemUser } from '@/types/domain';
import { invalidateUserQueries } from './useQueryInvalidation';

export const useUsersQuery = () =>
  useQuery({
    queryKey: queryKeys.users,
    queryFn: () => userRepository.selectAll(),
  });

export const useInsertUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: SystemUser) => userRepository.insert(user),
    onSuccess: () => {
      invalidateUserQueries(queryClient);
    },
  });
};

export const useModifyUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: SystemUser) => userRepository.modify(user),
    onSuccess: () => {
      invalidateUserQueries(queryClient);
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: SystemUser) => userRepository.delete(user),
    onSuccess: () => {
      invalidateUserQueries(queryClient);
    },
  });
};

