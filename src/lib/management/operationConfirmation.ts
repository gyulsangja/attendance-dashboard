import type { AttendanceRecord, ShiftSchedule } from '@/types/domain';
import {
  cloneAttendanceRecords,
  excludeItemsByPeriod,
  filterItemsByPeriod,
  isDateInPeriod,
  type OperationWeekPeriod,
} from '@/lib/management/operationWeek';
import { SHIFT_STATUS } from '@/lib/management/shiftSchedules';

type OperationConfirmationInput = {
  period: OperationWeekPeriod;
  deviceRecords: AttendanceRecord[];
  publishedRecords: AttendanceRecord[];
  shifts: ShiftSchedule[];
  confirmedWeekKeys: string[];
  confirmedShiftWeekKeys: string[];
};

type OperationConfirmationResult = {
  publishedRecords: AttendanceRecord[];
  shifts: ShiftSchedule[];
  confirmedWeekKeys: string[];
  confirmedShiftWeekKeys: string[];
  confirmed: boolean;
};

const addUnique = (items: string[], value: string) =>
  items.includes(value) ? items : [...items, value];

const removeValue = (items: string[], value: string) =>
  items.filter((item) => item !== value);

export const confirmOperationWeek = ({
  period,
  deviceRecords,
  publishedRecords,
  shifts,
  confirmedWeekKeys,
  confirmedShiftWeekKeys,
}: OperationConfirmationInput): OperationConfirmationResult => ({
  publishedRecords: [
    ...excludeItemsByPeriod(publishedRecords, period),
    ...cloneAttendanceRecords(filterItemsByPeriod(deviceRecords, period)),
  ],
  shifts: shifts.map((shift) =>
    isDateInPeriod(shift.date, period)
      ? { ...shift, status: SHIFT_STATUS.CONFIRMED }
      : shift,
  ),
  confirmedWeekKeys: addUnique(confirmedWeekKeys, period.key),
  confirmedShiftWeekKeys: addUnique(confirmedShiftWeekKeys, period.key),
  confirmed: true,
});

export const unconfirmOperationWeek = ({
  period,
  publishedRecords,
  shifts,
  confirmedWeekKeys,
  confirmedShiftWeekKeys,
}: OperationConfirmationInput): OperationConfirmationResult => ({
  publishedRecords: excludeItemsByPeriod(publishedRecords, period),
  shifts,
  confirmedWeekKeys: removeValue(confirmedWeekKeys, period.key),
  confirmedShiftWeekKeys,
  confirmed: false,
});
