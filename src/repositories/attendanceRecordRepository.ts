import { attendanceApi } from '@/api/attendanceApi';
import { adaptAttendanceManagerDtoToRecord } from '@/adapters/attendanceRecordAdapter';
import { attendanceRecords } from '@/mocks';
import type { AttendanceRecord } from '@/types/domain';
import { isApiDataSource } from './config';

export type AttendanceRecordRepository = {
  selectByWeek: (week: string) => Promise<AttendanceRecord[]>;
};

const mockAttendanceRecordRepository: AttendanceRecordRepository = {
  async selectByWeek() {
    return attendanceRecords.map((record) => ({
      ...record,
      events: record.events.map((event) => ({ ...event })),
    }));
  },
};

const overwriteDuplicateRecords = (records: AttendanceRecord[]) => {
  const recordMap = new Map<string, AttendanceRecord>();

  records.forEach((record) => {
    recordMap.set(`${record.employeeId}-${record.date}`, record);
  });

  return [...recordMap.values()];
};

const apiAttendanceRecordRepository: AttendanceRecordRepository = {
  async selectByWeek(week) {
    const records = await attendanceApi.selectByPeriod(week);
    return overwriteDuplicateRecords(records.map(adaptAttendanceManagerDtoToRecord));
  },
};

export const attendanceRecordRepository = isApiDataSource
  ? apiAttendanceRecordRepository
  : mockAttendanceRecordRepository;
