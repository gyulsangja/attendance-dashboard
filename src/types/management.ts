import type {
  AttendanceRecord,
  DeviceUploadSummary,
  OperationSchedule,
  ShiftSchedule,
} from './domain';

export type ManagementState = {
  year: number;
  month: number;
  weekNumber: number;
  schedules: OperationSchedule[];
  shifts: ShiftSchedule[];
  deviceRecords: AttendanceRecord[];
  publishedRecords: AttendanceRecord[];
  csvUploaded: boolean;
  deviceUpload: DeviceUploadSummary | null;
  confirmed: boolean;
  confirmedWeekKeys: string[];
  confirmedShiftWeekKeys: string[];
};

export type DeviceRecordPayload = {
  employeeId: number;
  date: string;
  checkIn: string;
  checkOut: string;
  employeeName?: string;
  department?: string;
  position?: string;
  events?: AttendanceRecord['events'];
};
