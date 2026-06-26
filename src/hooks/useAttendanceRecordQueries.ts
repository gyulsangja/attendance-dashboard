'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { attendanceRecordRepository } from '@/repositories/attendanceRecordRepository';

export const useAttendanceRecordsQuery = (periodKey: string) =>
  useQuery({
    queryKey: queryKeys.attendanceRecords(periodKey),
    queryFn: () => attendanceRecordRepository.selectByWeek(periodKey),
    enabled: Boolean(periodKey),
  });

export const useAttendanceRecordsByWeekQuery = useAttendanceRecordsQuery;
