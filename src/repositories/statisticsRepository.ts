import { statisticsApi, type StatisticsMonthlyParams, type StatisticsPeriodParams } from '@/api/statisticsApi';
import {
  adaptStatisticsRecordToAttendanceRecord,
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

const apiStatisticsRepository: StatisticsRepository = {
  async getAttendance(params) {
    const records = await statisticsApi.getAttendance(params);
    return records.map(adaptStatisticsRecordToAttendanceRecord);
  },
  async getEmployeeAttendance(empNo, params) {
    const response = await statisticsApi.getEmployeeAttendance(empNo, params);
    const records = response.records.map(adaptStatisticsRecordToAttendanceRecord);
    return { records, employees: adaptStatisticsRecordsToEmployees(records) };
  },
  async getMonthlyAttendanceRecords(params) {
    const records = (await statisticsApi.getMonthlyAttendanceRecords(params))
      .map(adaptStatisticsRecordToAttendanceRecord);
    return { records, employees: adaptStatisticsRecordsToEmployees(records) };
  },
};

export const statisticsRepository = isApiDataSource
  ? apiStatisticsRepository
  : mockStatisticsRepository;
