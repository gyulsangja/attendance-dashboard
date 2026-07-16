import { attendanceApi } from '@/api/attendanceApi';
import {
  adaptAttendanceManagerDtoToRecord,
  adaptAttendanceRecordToManagerDto,
} from '@/adapters/attendanceRecordAdapter';
import type { AttendanceRecord } from '@/types/domain';

export type AttendanceRecordRepository = {
  selectByWeek: (week: string) => Promise<AttendanceRecord[]>;
  modify: (record: AttendanceRecord) => Promise<void>;
  delete: (recordId: number) => Promise<void>;
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
  async delete(recordId) {
    await attendanceApi.deleteByEmployee(recordId);
  },
};

export const attendanceRecordRepository = apiAttendanceRecordRepository;
