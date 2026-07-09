import { apiClient } from './client';
import type { DashboardShiftScheduleDto, DashboardWeeklyDto } from './dto/dashboard.dto';

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

const unwrapDashboardBlock = (
  response: DashboardWeeklyDto | unknown[],
  blockKey: 'shift_weekly_schedules',
): DashboardWeeklyDto => {
  const unwrapped = Array.isArray(response) ? response : unwrapDashboardWeekly(response as DashboardWeeklyDto);
  return Array.isArray(unwrapped)
    ? { [blockKey]: unwrapped as DashboardShiftScheduleDto[] }
    : unwrapped;
};

const toCount = (value: unknown) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const adaptStatsDashToWeeklyDto = (dto: DashboardWeeklyDto): DashboardWeeklyDto => {
  const unwrapped = unwrapDashboardWeekly(dto);
  const codeCounts = [
    { attendance_code: 'ATT02', attendance_code_name: '지각', count: toCount(unwrapped.lateness_count ?? unwrapped.latenessCount) },
    { attendance_code: 'ATT03', attendance_code_name: '조퇴', count: toCount(unwrapped.early_leave_count ?? unwrapped.earlyLeaveCount) },
    { attendance_code: 'ATT04', attendance_code_name: '결근', count: toCount(unwrapped.from_work_count ?? unwrapped.fromWorkCount) },
    { attendance_code: 'ATT05', attendance_code_name: '연차', count: toCount(unwrapped.day_off_count ?? unwrapped.dayOffCount) },
    { attendance_code: 'ATT06_AM', attendance_code_name: '오전반차', count: toCount(unwrapped.morning_off_count ?? unwrapped.morningOffCount) },
    { attendance_code: 'ATT06_PM', attendance_code_name: '오후반차', count: toCount(unwrapped.afternoon_off_count ?? unwrapped.afternoonOffCount) },
    { attendance_code: 'DIRECT_WORK', attendance_code_name: '직출', count: toCount(unwrapped.direct_work_count ?? unwrapped.directWorkCount) },
    { attendance_code: 'DIRECT_LEAVE', attendance_code_name: '직퇴', count: toCount(unwrapped.direct_leave_count ?? unwrapped.directLeaveCount) },
    { attendance_code: 'SHIFT', attendance_code_name: '교대근무', count: toCount(unwrapped.shift_count ?? unwrapped.shiftCount) },
  ];

  return {
    ...unwrapped,
    operation_confirmed: unwrapped.operation_confirmed ?? unwrapped.operationConfirmed,
    summary_cards: [
      {
        label: '출근 기록',
        attendance_code: 'ATTENDANCE',
        attendance_code_name: '출근 기록',
        count: toCount(unwrapped.attendance_count ?? unwrapped.attendanceCount),
      },
      ...codeCounts.filter((item) => ['ATT02', 'ATT03', 'ATT04'].includes(item.attendance_code)),
    ],
    attendance_code_counts: codeCounts,
  };
};

const getStatsDash = async (params: DashboardWeeklyParams) => {
  const response = await apiClient<DashboardWeeklyDto>(
    `/api/attend/manager/stats/dash/${params.year}/${params.month}/${params.week}`,
  );
  return adaptStatsDashToWeeklyDto(response);
};

export const dashboardApi = {
  async getWeekly(params: DashboardWeeklyParams) {
    return getStatsDash(params);
  },
  getWeeklySummary(params: DashboardWeeklyParams) {
    return getStatsDash(params);
  },
  getWeeklyAttendanceCodeCounts(params: DashboardWeeklyParams) {
    return getStatsDash(params);
  },
  getWeeklyExceptionalRecords(params: DashboardWeeklyParams) {
    void params;
    return Promise.resolve({ exceptional_attendance_records: [] });
  },
  getWeeklyPlans(params: DashboardWeeklyParams) {
    void params;
    return Promise.resolve({ weekly_attendance_plans: [] });
  },
  async getWeeklyShiftSchedules(params: DashboardWeeklyParams) {
    const response = await apiClient<DashboardWeeklyDto | DashboardShiftScheduleDto[]>(
      '/api/employee/shiften/select/items',
      {
        method: 'POST',
        body: {
          select_type: '3',
          year: params.year,
          month: params.month,
          week: params.week,
        },
      },
    );
    return unwrapDashboardBlock(response, 'shift_weekly_schedules');
  },
};
