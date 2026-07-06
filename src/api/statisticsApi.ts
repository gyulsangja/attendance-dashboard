import { apiClient } from './client';
import type {
  StatisticsAttendanceRecordDto,
  StatisticsAttendanceResponseDto,
  StatisticsEmployeeAttendanceResponseDto,
  StatisticsPeriodType,
} from './dto/statistics.dto';

export type StatisticsPeriodParams = {
  periodType: StatisticsPeriodType;
  year: number;
  month?: number;
  week?: number;
};

export type StatisticsMonthlyParams = {
  year: number;
  month: number;
};

const toParams = (params: Record<string, number | string | undefined>) => {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .reduce<Record<string, string>>((result, [key, value]) => {
      result[key] = String(value);
      return result;
    }, {});

  return new URLSearchParams(entries).toString();
};

const getRows = (response: StatisticsAttendanceRecordDto[] | StatisticsAttendanceResponseDto) => {
  if (Array.isArray(response)) return response;

  return response.records ?? response.items ?? response.rows ?? response.list ?? response.data ?? [];
};

export const statisticsApi = {
  async getAttendance(params: StatisticsPeriodParams) {
    const response = await apiClient<
      StatisticsAttendanceRecordDto[] | StatisticsAttendanceResponseDto
    >(`/api/statistics/attendance?${toParams({
      period_type: params.periodType,
      year: params.year,
      month: params.month,
      week: params.week,
    })}`);

    return getRows(response);
  },

  async getEmployeeAttendance(empNo: number | string, params: StatisticsPeriodParams) {
    const response = await apiClient<StatisticsEmployeeAttendanceResponseDto>(
      `/api/statistics/employee-attendance/${empNo}?${toParams({
        period_type: params.periodType,
        year: params.year,
        month: params.month,
        week: params.week,
      })}`,
    );

    return {
      employee: response.employee,
      records: response.records ?? response.items ?? response.rows ?? response.list ?? response.data ?? [],
    };
  },

  async getMonthlyAttendanceRecords(params: StatisticsMonthlyParams) {
    const response = await apiClient<
      StatisticsAttendanceRecordDto[] | StatisticsAttendanceResponseDto
    >(`/api/statistics/attendance-records/monthly?${toParams(params)}`);

    return getRows(response);
  },
};
