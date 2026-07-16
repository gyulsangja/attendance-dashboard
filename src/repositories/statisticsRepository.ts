import { attendanceApi } from '@/api/attendanceApi';
import { employeeApi } from '@/api/employeeApi';
import type { StatisticsMonthlyParams, StatisticsPeriodParams } from '@/api/statisticsApi';
import { adaptAttendanceManagerDtoToRecord } from '@/adapters/attendanceRecordAdapter';
import {
  adaptEmployeeAttendDtoToAttendanceRecord,
  adaptStatisticsRecordsToEmployees,
} from '@/adapters/statisticsAdapter';
import type { AttendanceRecord, ReportEmployee } from '@/types/domain';

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

const getEmployeeAttendSelectPayload = (params: StatisticsPeriodParams) => {
  if (params.periodType === 'WEEK' && params.month && params.week) {
    return {
      select_type: '2',
      year: String(params.year),
      month: String(params.month),
      week: String(params.week),
    };
  }

  if (params.periodType === 'MONTH' && params.month) {
    return {
      select_type: '2',
      year: String(params.year),
      month: String(params.month),
      week: '',
    };
  }

  return {
    select_type: '3',
    year: String(params.year),
    month: '',
    week: '',
  };
};

const selectEmployeeAttendByPeriod = async (params: StatisticsPeriodParams) => {
  return employeeApi.selectAttendAll(getEmployeeAttendSelectPayload(params));
};

const apiStatisticsRepository: StatisticsRepository = {
  async getAttendance(params) {
    const records = await selectEmployeeAttendByPeriod(params);
    return records.map(adaptEmployeeAttendDtoToAttendanceRecord);
  },
  async getEmployeeAttendance(empNo, params) {
    const records = (await selectEmployeeAttendByPeriod(params))
      .map(adaptEmployeeAttendDtoToAttendanceRecord)
      .filter((record) => String(record.employeeId) === String(empNo));

    return { records, employees: adaptStatisticsRecordsToEmployees(records) };
  },
  async getMonthlyAttendanceRecords(params) {
    const records = (await attendanceApi.selectByPeriod(getPeriodKey(params)))
      .map(adaptAttendanceManagerDtoToRecord);
    return { records, employees: adaptStatisticsRecordsToEmployees(records) };
  },
};

export const statisticsRepository = apiStatisticsRepository;
