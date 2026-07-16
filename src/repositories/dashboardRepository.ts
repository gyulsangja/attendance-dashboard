import { dashboardApi, type DashboardWeeklyParams } from '@/api/dashboardApi';
import type { DashboardWeeklyDto } from '@/api/dto/dashboard.dto';

export type DashboardRepository = {
  getWeekly: (params: DashboardWeeklyParams) => Promise<DashboardWeeklyDto | null>;
  getWeeklySummary: (params: DashboardWeeklyParams) => Promise<DashboardWeeklyDto | null>;
  getWeeklyAttendanceCodeCounts: (params: DashboardWeeklyParams) => Promise<DashboardWeeklyDto | null>;
  getWeeklyExceptionalRecords: (params: DashboardWeeklyParams) => Promise<DashboardWeeklyDto | null>;
  getWeeklyPlans: (params: DashboardWeeklyParams) => Promise<DashboardWeeklyDto | null>;
  getWeeklyShiftSchedules: (params: DashboardWeeklyParams) => Promise<DashboardWeeklyDto | null>;
};

const apiDashboardRepository: DashboardRepository = {
  getWeekly(params) {
    return dashboardApi.getWeekly(params);
  },
  getWeeklySummary(params) {
    return dashboardApi.getWeeklySummary(params);
  },
  getWeeklyAttendanceCodeCounts(params) {
    return dashboardApi.getWeeklyAttendanceCodeCounts(params);
  },
  getWeeklyExceptionalRecords(params) {
    return dashboardApi.getWeeklyExceptionalRecords(params);
  },
  getWeeklyPlans(params) {
    return dashboardApi.getWeeklyPlans(params);
  },
  getWeeklyShiftSchedules(params) {
    return dashboardApi.getWeeklyShiftSchedules(params);
  },
};

export const dashboardRepository = apiDashboardRepository;
