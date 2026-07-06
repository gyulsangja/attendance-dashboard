import { dashboardApi, type DashboardWeeklyParams } from '@/api/dashboardApi';
import type { DashboardWeeklyDto } from '@/api/dto/dashboard.dto';
import { isApiDataSource } from './config';

export type DashboardRepository = {
  getWeekly: (params: DashboardWeeklyParams) => Promise<DashboardWeeklyDto | null>;
};

const mockDashboardRepository: DashboardRepository = {
  async getWeekly() {
    return null;
  },
};

const apiDashboardRepository: DashboardRepository = {
  getWeekly(params) {
    return dashboardApi.getWeekly(params);
  },
};

export const dashboardRepository = isApiDataSource
  ? apiDashboardRepository
  : mockDashboardRepository;
