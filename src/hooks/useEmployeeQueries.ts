'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { employeeRepository } from '@/repositories/employeeRepository';
import type { OrganizationEmployee } from '@/types/domain';
import { invalidateEmployeeQueries } from './useQueryInvalidation';

export const useEmployeesQuery = () =>
  useQuery({
    queryKey: queryKeys.employees,
    queryFn: () => employeeRepository.selectAll(),
  });

export const useOrganizationEmployeesQuery = () =>
  useQuery({
    queryKey: queryKeys.organizationEmployees,
    queryFn: () => employeeRepository.selectOrganizationEmployees(),
  });


export const useInsertEmployeeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employee: OrganizationEmployee) => employeeRepository.insert(employee),
    onSuccess: () => invalidateEmployeeQueries(queryClient),
  });
};

export const useModifyEmployeeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employee: OrganizationEmployee) => employeeRepository.modify(employee),
    onSuccess: () => invalidateEmployeeQueries(queryClient),
  });
};

export const useDeleteEmployeeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employee: OrganizationEmployee) => employeeRepository.delete(employee),
    onSuccess: () => invalidateEmployeeQueries(queryClient),
  });
};

