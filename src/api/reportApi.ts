import { apiClient } from './client';
import type { WeeklyReportDto } from './dto/report.dto';

export type WeeklyReportParams = {
  year: number;
  month: number;
  week: number;
};

export const reportApi = {
  getWeekly(params: WeeklyReportParams) {
    const searchParams = new URLSearchParams({
      year: String(params.year),
      month: String(params.month),
      week: String(params.week),
    });

    return apiClient<WeeklyReportDto>(`/api/report/weekly?${searchParams.toString()}`);
  },
};
