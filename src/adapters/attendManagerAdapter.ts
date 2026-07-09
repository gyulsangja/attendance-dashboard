import type {
  AttendManagerConfirmStatusDto,
  AttendManagerShiftScheduleDto,
  AttendManagerSummaryDto,
} from '@/api/dto/attendManager.dto';
import { SHIFT_STATUS } from '@/lib/management/shiftSchedules';
import type { ShiftSchedule } from '@/types/domain';

const toNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const shiftTimeByType: Record<string, { checkIn: string; checkOut: string }> = {
  SHIFT_DAY: { checkIn: '09:00', checkOut: '18:00' },
  SHIFT_AFTERNOON: { checkIn: '12:00', checkOut: '21:00' },
  SHIFT_NIGHT: { checkIn: '21:00', checkOut: '09:00' },
};

const getShiftType = (dto: AttendManagerShiftScheduleDto) =>
  dto.shift_type ?? dto.shiftType ?? dto.shift_code ?? dto.shiftCode ?? dto.shift_name ?? dto.shiftName ?? '';

export const toApiBoolean = (value: unknown, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null || value === '') return fallback;
  const normalized = String(value).trim().toUpperCase();
  if (['Y', 'YES', 'TRUE', '1', 'CONFIRMED'].includes(normalized)) return true;
  if (['N', 'NO', 'FALSE', '0', 'PENDING'].includes(normalized)) return false;
  return fallback;
};

export const adaptAttendManagerConfirmStatus = (
  dto: AttendManagerConfirmStatusDto | null | undefined,
  fallback: boolean,
) => toApiBoolean(dto?.is_confirmed ?? dto?.isConfirmed, fallback);

export const adaptAttendManagerSummary = (
  dto: AttendManagerSummaryDto | null | undefined,
) => {
  if (!dto) return null;

  return {
    operationConfirmed: toApiBoolean(
      dto.operation_confirmed ?? dto.operationConfirmed,
      false,
    ),
    shiftConfirmed: toApiBoolean(dto.shift_confirmed ?? dto.shiftConfirmed, false),
    attendanceScheduleCount: toNumber(
      dto.attendance_schedule_count ?? dto.attendanceScheduleCount,
    ),
    deviceRecordCount: toNumber(dto.device_record_count ?? dto.deviceRecordCount),
    canModify: toApiBoolean(dto.can_modify ?? dto.canModify, true),
  };
};

export const adaptAttendManagerShiftDtoToSchedule = (
  dto: AttendManagerShiftScheduleDto,
  index: number,
): ShiftSchedule => {
  const shiftType = getShiftType(dto);
  const shiftTime = shiftTimeByType[shiftType] ?? { checkIn: '', checkOut: '' };
  const startTime = dto.start_time ?? dto.startTime ?? shiftTime.checkIn;
  const endTime = dto.end_time ?? dto.endTime ?? shiftTime.checkOut;
  const isNextDay = toApiBoolean(dto.is_next_day ?? dto.isNextDay)
    || Boolean(startTime && endTime && endTime <= startTime);
  const time = `${startTime} ~ ${isNextDay ? '익일 ' : ''}${endTime}`;

  return {
    id: toNumber(dto.shift_schedule_id ?? dto.shiftScheduleId ?? dto.id ?? dto.idx, index + 1),
    date: dto.work_date ?? dto.workDate ?? dto.date ?? '',
    employeeId: toNumber(dto.emp_no ?? dto.empNo, index + 1),
    name: dto.emp_name ?? dto.empName ?? '',
    shift: shiftType || time,
    time,
    status: SHIFT_STATUS.CONFIRMED,
    checkIn: startTime,
    checkOut: endTime,
  };
};

export const adaptShiftScheduleToAttendManagerDto = (
  shift: ShiftSchedule,
): AttendManagerShiftScheduleDto => ({
  idx: shift.id,
  shift_schedule_id: shift.id,
  emp_no: shift.employeeId,
  emp_name: shift.name,
  work_date: shift.date,
  shift_type: shift.shift,
  start_time: shift.checkIn,
  end_time: shift.checkOut,
  is_next_day: Boolean(
    shift.checkIn
    && shift.checkOut
    && shift.checkOut <= shift.checkIn,
  ),
});
