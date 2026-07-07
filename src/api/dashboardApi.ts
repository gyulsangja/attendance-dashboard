import { apiClient } from './client';
import type { DashboardWeeklyDto } from './dto/dashboard.dto';

export type DashboardWeeklyParams = {
  year: number;
  month: number;
  week: number;
};

type DashboardBlockKey =
  | 'summary_cards'
  | 'attendance_code_counts'
  | 'exceptional_attendance_records'
  | 'weekly_attendance_plans'
  | 'shift_weekly_schedules';

const createParams = ({ year, month, week }: DashboardWeeklyParams) => new URLSearchParams({
  year: String(year),
  month: String(month),
  week: String(week),
});

const unwrapDashboardWeekly = (response: DashboardWeeklyDto) =>
  response.data
  ?? response.result
  ?? response.dashboard
  ?? response.weekly_dashboard
  ?? response.weeklyDashboard
  ?? response;

const unwrapDashboardBlock = (
  response: DashboardWeeklyDto | unknown[],
  blockKey: DashboardBlockKey,
): DashboardWeeklyDto => {
  const unwrapped = Array.isArray(response) ? response : unwrapDashboardWeekly(response as DashboardWeeklyDto);
  return Array.isArray(unwrapped) ? { [blockKey]: unwrapped } : unwrapped;
};

const getDashboardBlock = async (
  path: string,
  params: DashboardWeeklyParams,
  blockKey: DashboardBlockKey,
) => {
  const response = await apiClient<DashboardWeeklyDto | unknown[]>(`${path}?${createParams(params).toString()}`);
  return unwrapDashboardBlock(response, blockKey);
};

export const dashboardApi = {
  async getWeekly(params: DashboardWeeklyParams) {
    const response = await apiClient<DashboardWeeklyDto>(`/api/dashboard/weekly?${createParams(params).toString()}`);
    return unwrapDashboardWeekly(response);
  },
  getWeeklySummary(params: DashboardWeeklyParams) {
    return getDashboardBlock('/api/dashboard/weekly/summary', params, 'summary_cards');
  },
  getWeeklyAttendanceCodeCounts(params: DashboardWeeklyParams) {
    return getDashboardBlock('/api/dashboard/weekly/attendance-codes', params, 'attendance_code_counts');
  },
  getWeeklyExceptionalRecords(params: DashboardWeeklyParams) {
    return getDashboardBlock('/api/dashboard/weekly/exceptional-records', params, 'exceptional_attendance_records');
  },
  getWeeklyPlans(params: DashboardWeeklyParams) {
    return getDashboardBlock('/api/dashboard/weekly/plans', params, 'weekly_attendance_plans');
  },
  getWeeklyShiftSchedules(params: DashboardWeeklyParams) {
    return getDashboardBlock('/api/dashboard/weekly/shift-schedules', params, 'shift_weekly_schedules');
  },
};
