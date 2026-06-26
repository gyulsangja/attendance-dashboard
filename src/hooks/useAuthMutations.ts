'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authRepository } from '@/repositories/authRepository';

type LoginVariables = {
  username: string;
  password: string;
};

export const useLoginMutation = () =>
  useMutation({
    mutationFn: ({ username, password }: LoginVariables) =>
      authRepository.login(username, password),
  });

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authRepository.logout(),
    onSettled: () => {
      queryClient.clear();
    },
  });
};
