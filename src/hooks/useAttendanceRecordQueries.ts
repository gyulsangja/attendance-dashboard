'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { attendanceRecordRepository } from '@/repositories/attendanceRecordRepository';
import type { AttendanceRecord } from '@/types/domain';
import {
  invalidateAttendManagerQueries,
  invalidateAttendanceRecordQueries,
} from './useQueryInvalidation';

export const useAttendanceRecordsQuery = (periodKey: string) =>
  useQuery({
    queryKey: queryKeys.attendanceRecords(periodKey),
    queryFn: () => attendanceRecordRepository.selectByWeek(periodKey),
    enabled: Boolean(periodKey),
  });

export const useAttendanceRecordsByWeekQuery = useAttendanceRecordsQuery;
export const useModifyAttendanceRecordMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (record: AttendanceRecord) => attendanceRecordRepository.modify(record),
    onSuccess: () => {
      invalidateAttendanceRecordQueries(queryClient);
      invalidateAttendManagerQueries(queryClient);
    },
  });
};

export const useDeleteAttendanceRecordMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recordId: number) => attendanceRecordRepository.delete(recordId),
    onSuccess: () => {
      invalidateAttendanceRecordQueries(queryClient);
      invalidateAttendManagerQueries(queryClient);
    },
  });
};
