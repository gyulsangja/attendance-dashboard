import { reportApi, type WeeklyReportParams } from '@/api/reportApi';
import type { WeeklyReportDto } from '@/api/dto/report.dto';
import { isApiDataSource } from './config';

type ReportRepository = {
  getWeekly(params: WeeklyReportParams): Promise<WeeklyReportDto | undefined>;
};

const mockReportRepository: ReportRepository = {
  async getWeekly() {
    return undefined;
  },
};

const apiReportRepository: ReportRepository = {
  getWeekly: reportApi.getWeekly,
};

export const reportRepository = isApiDataSource
  ? apiReportRepository
  : mockReportRepository;
