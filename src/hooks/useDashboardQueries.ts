'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { dashboardRepository } from '@/repositories/dashboardRepository';

export const useDashboardWeeklyQuery = (year: number, month: number, week: number) =>
  useQuery({
    queryKey: queryKeys.dashboardWeekly(year, month, week),
    queryFn: () => dashboardRepository.getWeekly({ year, month, week }),
    enabled: Boolean(year && month && week),
    retry: false,
  });
