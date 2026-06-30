import { attendanceApi } from '@/api/attendanceApi';
import {
  adaptAttendanceManagerDtoToRecord,
  adaptAttendanceRecordToManagerDto,
} from '@/adapters/attendanceRecordAdapter';
import { attendanceRecords } from '@/mocks';
import type { AttendanceRecord } from '@/types/domain';
import { isApiDataSource } from './config';

export type AttendanceRecordRepository = {
  selectByWeek: (week: string) => Promise<AttendanceRecord[]>;
  modify: (record: AttendanceRecord) => Promise<void>;
};

const mockAttendanceRecordRepository: AttendanceRecordRepository = {
  async selectByWeek() {
    return attendanceRecords.map((record) => ({
      ...record,
      events: record.events.map((event) => ({ ...event })),
    }));
  },
  async modify() {},
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
  async modify(record) {
    await attendanceApi.modify(adaptAttendanceRecordToManagerDto(record));
  },
};

export const attendanceRecordRepository = isApiDataSource
  ? apiAttendanceRecordRepository
  : mockAttendanceRecordRepository;
