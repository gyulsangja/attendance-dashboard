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

const selectAttendanceManagerByPeriod = async (params: StatisticsPeriodParams) => {
  return attendanceApi.selectByPeriod(getPeriodKey(params));
};

const mergeAttendanceRecords = (
  employeeAttendRecords: AttendanceRecord[],
  managerRecords: AttendanceRecord[],
) => {
  const recordMap = new Map<string, AttendanceRecord>();

  const getKey = (record: AttendanceRecord) => `${record.employeeId}-${record.date}`;

  managerRecords.forEach((record) => {
    recordMap.set(getKey(record), {
      ...record,
      events: [...record.events],
    });
  });

  employeeAttendRecords.forEach((record) => {
    const key = getKey(record);
    const current = recordMap.get(key);

    if (!current) {
      recordMap.set(key, {
        ...record,
        events: [...record.events],
      });
      return;
    }

    const eventMap = new Map(
      current.events.map((event) => [
        `${event.codeId}-${event.detail ?? ''}`,
        event,
      ]),
    );
    record.events.forEach((event) => {
      const exactKey = `${event.codeId}-${event.detail ?? ''}`;
      const sameCodeKey = [...eventMap.keys()].find((item) => item.startsWith(`${event.codeId}-`));
      if (sameCodeKey) return;
      eventMap.set(exactKey, event);
    });

    recordMap.set(key, {
      ...current,
      employeeName: current.employeeName !== '-' ? current.employeeName : record.employeeName,
      department: current.department !== '-' ? current.department : record.department,
      position: current.position !== '-' ? current.position : record.position,
      checkIn: current.checkIn ?? record.checkIn,
      checkOut: current.checkOut ?? record.checkOut,
      memo: current.memo ?? record.memo,
      isHoliday: current.isHoliday ?? record.isHoliday,
      holidayName: current.holidayName ?? record.holidayName,
      isShiftWorker: current.isShiftWorker ?? record.isShiftWorker,
      events: [...eventMap.values()],
    });
  });

  return [...recordMap.values()].sort((a, b) =>
    a.date.localeCompare(b.date)
    || a.department.localeCompare(b.department, 'ko')
    || a.employeeName.localeCompare(b.employeeName, 'ko'));
};

const apiStatisticsRepository: StatisticsRepository = {
  async getAttendance(params) {
    const [employeeAttendRows, managerRows] = await Promise.all([
      selectEmployeeAttendByPeriod(params),
      selectAttendanceManagerByPeriod(params),
    ]);
    return mergeAttendanceRecords(
      employeeAttendRows.map(adaptEmployeeAttendDtoToAttendanceRecord),
      managerRows.map(adaptAttendanceManagerDtoToRecord),
    );
  },
  async getEmployeeAttendance(empNo, params) {
    const records = (await apiStatisticsRepository.getAttendance(params))
      .filter((record) => String(record.employeeId) === String(empNo));

    return { records, employees: adaptStatisticsRecordsToEmployees(records) };
  },
  async getMonthlyAttendanceRecords(params) {
    const records = await apiStatisticsRepository.getAttendance({
      periodType: 'MONTH',
      year: params.year,
      month: params.month,
    });
    return { records, employees: adaptStatisticsRecordsToEmployees(records) };
  },
};

export const statisticsRepository = apiStatisticsRepository;
