'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { reportRepository } from '@/repositories/reportRepository';

export const useWeeklyReportQuery = (
  year: number,
  month: number,
  week: number,
) =>
  useQuery({
    queryKey: queryKeys.weeklyReport(year, month, week),
    queryFn: () => reportRepository.getWeekly({ year, month, week }),
    enabled: Boolean(year && month && week),
    retry: false,
  });
