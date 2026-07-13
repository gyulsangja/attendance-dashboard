import { attendanceApi } from '@/api/attendanceApi';
import type { StatisticsMonthlyParams, StatisticsPeriodParams } from '@/api/statisticsApi';
import { adaptAttendanceManagerDtoToRecord } from '@/adapters/attendanceRecordAdapter';
import {
  adaptStatisticsRecordsToEmployees,
} from '@/adapters/statisticsAdapter';
import type { AttendanceRecord, ReportEmployee } from '@/types/domain';
import { isApiDataSource } from './config';

export type StatisticsRepository = {
  getAttendance: (params: StatisticsPeriodParams) => Promise<AttendanceRecord[]>;
  getEmployeeAttendance: (
    empNo: number | string,
    params: StatisticsPeriodParams
  ) => Promise<{ records: AttendanceRecord[]; employees: ReportEmployee[] }>;
  getMonthlyAttendanceRecords: (
    params: StatisticsMonthlyParams
  ) => Promise<{ records: AttendanceRecord[]; employees: ReportEmployee[] }>;
};

const mockStatisticsRepository: StatisticsRepository = {
  async getAttendance() {
    return [];
  },
  async getEmployeeAttendance() {
    return { records: [], employees: [] };
  },
  async getMonthlyAttendanceRecords() {
    return { records: [], employees: [] };
  },
};

const getPeriodKey = (params: StatisticsPeriodParams | StatisticsMonthlyParams) => {
  if ('periodType' in params) {
    if (params.periodType === 'WEEK' && params.month && params.week) {
      return `${params.year}-${params.month}-${params.week}`;
    }
    if (params.periodType === 'MONTH' && params.month) {
      return `${params.year}-${params.month}`;
    }
  }

  if ('month' in params && params.month) return `${params.year}-${params.month}`;
  return String(params.year);
};

const apiStatisticsRepository: StatisticsRepository = {
  async getAttendance(params) {
    const records = await attendanceApi.selectByPeriod(getPeriodKey(params));
    return records.map(adaptAttendanceManagerDtoToRecord);
  },
  async getEmployeeAttendance(empNo, params) {
    const records = (await attendanceApi.selectByPeriod(getPeriodKey(params)))
      .map(adaptAttendanceManagerDtoToRecord)
      .filter((record) => String(record.employeeId) === String(empNo));

    return { records, employees: adaptStatisticsRecordsToEmployees(records) };
  },
  async getMonthlyAttendanceRecords(params) {
    const records = (await attendanceApi.selectByPeriod(getPeriodKey(params)))
      .map(adaptAttendanceManagerDtoToRecord);
    return { records, employees: adaptStatisticsRecordsToEmployees(records) };
  },
};

export const statisticsRepository = isApiDataSource
  ? apiStatisticsRepository
  : mockStatisticsRepository;
