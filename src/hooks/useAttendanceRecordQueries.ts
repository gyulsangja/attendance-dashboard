'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { attendanceRecordRepository } from '@/repositories/attendanceRecordRepository';
import type { AttendanceRecord } from '@/types/domain';
import { invalidateAttendanceRecordQueries } from './useQueryInvalidation';

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
    onSuccess: () => invalidateAttendanceRecordQueries(queryClient),
  });
};
