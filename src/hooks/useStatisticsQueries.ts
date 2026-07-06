'use client';

import { useQuery } from '@tanstack/react-query';
import type { StatisticsPeriodType } from '@/api/dto/statistics.dto';
import { queryKeys } from '@/lib/queryKeys';
import { statisticsRepository } from '@/repositories/statisticsRepository';

export type StatisticsPeriodQuery = {
  periodType: StatisticsPeriodType;
  year: number;
  month?: number;
  week?: number;
};

export const useStatisticsAttendanceQuery = (params: StatisticsPeriodQuery) =>
  useQuery({
    queryKey: queryKeys.statisticsAttendance(
      params.periodType,
      params.year,
      params.month,
      params.week,
    ),
    queryFn: () => statisticsRepository.getAttendance(params),
    enabled: Boolean(params.year),
    retry: false,
  });

export const useStatisticsEmployeeAttendanceQuery = (
  empNo: number | string | null,
  params: StatisticsPeriodQuery,
) =>
  useQuery({
    queryKey: queryKeys.statisticsEmployeeAttendance(
      empNo ?? '',
      params.periodType,
      params.year,
      params.month,
      params.week,
    ),
    queryFn: () => statisticsRepository.getEmployeeAttendance(empNo ?? '', params),
    enabled: Boolean(empNo && params.year),
    retry: false,
  });

export const useStatisticsMonthlyAttendanceRecordsQuery = (year: number, month: number) =>
  useQuery({
    queryKey: queryKeys.statisticsMonthlyAttendanceRecords(year, month),
    queryFn: () => statisticsRepository.getMonthlyAttendanceRecords({ year, month }),
    enabled: Boolean(year && month),
    retry: false,
  });
