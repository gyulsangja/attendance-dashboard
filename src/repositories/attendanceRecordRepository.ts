import { attendanceApi } from '@/api/attendanceApi';
import {
  adaptAttendanceManagerDtoToRecord,
  adaptAttendanceRecordToManagerDto,
} from '@/adapters/attendanceRecordAdapter';
import type { AttendanceRecord } from '@/types/domain';

export type AttendanceRecordRepository = {
  selectByWeek: (week: string) => Promise<AttendanceRecord[]>;
  insert: (record: AttendanceRecord) => Promise<void>;
  modify: (record: AttendanceRecord) => Promise<void>;
  delete: (recordId: number) => Promise<void>;
  updateAttendance: (year: number, month: number, week: number) => Promise<void>;
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
  async insert(record) {
    const payload = adaptAttendanceRecordToManagerDto(record);
    delete payload.idx;
    await attendanceApi.insert(payload);
  },
  async modify(record) {
    await attendanceApi.modify(adaptAttendanceRecordToManagerDto(record));
  },
  async delete(recordId) {
    await attendanceApi.deleteByEmployee(recordId);
  },
  async updateAttendance(year, month, week) {
    await attendanceApi.updateAttendance(year, month, week);
  },
};

export const attendanceRecordRepository = apiAttendanceRecordRepository;
