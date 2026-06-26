import {
  attendanceRecords,
  confirmedOperationWeeks,
  operationSchedules,
  shiftSchedules,
  shiftWorkers,
} from '@/mocks';
import { getPreviousWeekPeriod } from '@/lib/date';
import { getReportEmployeesForDate } from '@/mocks/reports/reportData';
import type { ManagementState } from '@/types/management';
import {
  buildInitialDeviceRecords,
  filterRecordsByConfirmedOperationWeeks,
} from './initialDeviceRecords';
import {
  buildOperationWeekKey,
  cloneAttendanceRecords,
} from './operationWeek';

const UPLOADED_RECORD_PERIOD = {
  startDate: '2026-06-07',
  endDate: '2026-06-13',
};

export const buildInitialManagementState = (): ManagementState => {
  const shiftWorkerIds = new Set(shiftWorkers.map((worker) => worker.employeeId));
  const deviceRecords = buildInitialDeviceRecords({
    attendanceRecords,
    confirmedOperationWeeks,
    operationSchedules,
    shiftSchedules,
    shiftWorkerIds,
    getEmployeesForDate: getReportEmployeesForDate,
  });
  const confirmedRecords = filterRecordsByConfirmedOperationWeeks(
    deviceRecords,
    confirmedOperationWeeks,
  );
  const uploadedRecords = attendanceRecords.filter(
    (record) =>
      record.date >= UPLOADED_RECORD_PERIOD.startDate
      && record.date <= UPLOADED_RECORD_PERIOD.endDate,
  );
  const defaultOperationWeek = getPreviousWeekPeriod();
  const confirmedWeekKeys = confirmedOperationWeeks.map((period) => period.key);
  const confirmedShiftWeekKeys = [...new Set([
    '2026-6-2',
    ...confirmedWeekKeys,
  ])];
  const defaultOperationWeekKey = buildOperationWeekKey(
    defaultOperationWeek.year,
    defaultOperationWeek.month,
    defaultOperationWeek.weekNumber,
  );

  return {
    year: defaultOperationWeek.year,
    month: defaultOperationWeek.month,
    weekNumber: defaultOperationWeek.weekNumber,
    schedules: operationSchedules,
    shifts: shiftSchedules,
    deviceRecords,
    publishedRecords: cloneAttendanceRecords(confirmedRecords),
    csvUploaded: true,
    deviceUpload: {
      fileName: 'attendance_20260607_20260613.csv',
      uploadedAt: '2026. 6. 14. 오전 9:12',
      startDate: UPLOADED_RECORD_PERIOD.startDate,
      endDate: UPLOADED_RECORD_PERIOD.endDate,
      totalRows: uploadedRecords.length,
      validRows: uploadedRecords.length,
      errorRows: 0,
      absenceRows: confirmedRecords.filter(
        (record) => record.events.some((event) => event.codeId === 'ABSENT'),
      ).length,
      errors: [],
    },
    confirmed: confirmedWeekKeys.includes(defaultOperationWeekKey),
    confirmedWeekKeys,
    confirmedShiftWeekKeys,
  };
};
