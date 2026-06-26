'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { invalidateAttendanceCodeQueries } from './useQueryInvalidation';
import { attendanceCodeRepository } from '@/repositories/attendanceCodeRepository';
import type { AttendanceCode } from '@/types/domain';

export const useAttendanceCodesQuery = () =>
  useQuery({
    queryKey: queryKeys.attendanceCodes,
    queryFn: () => attendanceCodeRepository.selectAll(),
  });

export const useInsertAttendanceCodeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: AttendanceCode) => attendanceCodeRepository.insert(code),
    onSuccess: () => {
      invalidateAttendanceCodeQueries(queryClient);
    },
  });
};

export const useModifyAttendanceCodeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: AttendanceCode) => attendanceCodeRepository.modify(code),
    onSuccess: () => {
      invalidateAttendanceCodeQueries(queryClient);
    },
  });
};

export const useEndAttendanceCodeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, effectiveDate }: { code: AttendanceCode; effectiveDate: string }) =>
      attendanceCodeRepository.end(code, effectiveDate),
    onSuccess: () => {
      invalidateAttendanceCodeQueries(queryClient);
    },
  });
};

