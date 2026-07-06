import { apiClient } from './client';
import type { DashboardWeeklyDto } from './dto/dashboard.dto';

export type DashboardWeeklyParams = {
  year: number;
  month: number;
  week: number;
};

const unwrapDashboardWeekly = (response: DashboardWeeklyDto) =>
  response.data
  ?? response.result
  ?? response.dashboard
  ?? response.weekly_dashboard
  ?? response.weeklyDashboard
  ?? response;

export const dashboardApi = {
  async getWeekly({ year, month, week }: DashboardWeeklyParams) {
    const params = new URLSearchParams({
      year: String(year),
      month: String(month),
      week: String(week),
    });

    const response = await apiClient<DashboardWeeklyDto>(`/api/dashboard/weekly?${params.toString()}`);
    return unwrapDashboardWeekly(response);
  },
};
