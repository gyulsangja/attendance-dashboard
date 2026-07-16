import { reportApi, type WeeklyReportParams } from '@/api/reportApi';
import type { WeeklyReportDto } from '@/api/dto/report.dto';

type ReportRepository = {
  getWeekly(params: WeeklyReportParams): Promise<WeeklyReportDto | undefined>;
};

const apiReportRepository: ReportRepository = {
  getWeekly: reportApi.getWeekly,
};

export const reportRepository = apiReportRepository;
