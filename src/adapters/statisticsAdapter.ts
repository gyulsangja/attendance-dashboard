import type { StatisticsAttendanceRecordDto } from '@/api/dto/statistics.dto';
import type { AttendanceRecord, ReportEmployee } from '@/types/domain';

const toNumber = (value: unknown, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const toIdNumber = (value: unknown, fallbackText: string) => {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric;
  return fallbackText.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
};

export const toApiBoolean = (value: unknown, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null || value === '') return fallback;
  const normalized = String(value).trim().toUpperCase();
  if (['Y', 'YES', 'TRUE', '1'].includes(normalized)) return true;
  if (['N', 'NO', 'FALSE', '0'].includes(normalized)) return false;
  return fallback;
};

export const adaptStatisticsRecordToAttendanceRecord = (
  dto: StatisticsAttendanceRecordDto,
  index: number,
): AttendanceRecord => {
  const empNo = dto.emp_no ?? dto.empNo ?? index + 1;
  const date = dto.work_date ?? dto.workDate ?? dto.attend_date ?? dto.attendDate ?? '';
  const codeId = dto.attendance_code ?? dto.attendanceCode ?? dto.detail_code ?? dto.detailCode;
  const codeName = dto.attendance_code_name ?? dto.attendanceCodeName;
  const detail = dto.detail
    ?? dto.memo
    ?? dto.reason
    ?? dto.attend_reason
    ?? dto.attendReason
    ?? codeName
    ?? '';

  return {
    id: toNumber(dto.id, toIdNumber(`${empNo}-${date}-${index}`, `${empNo}-${date}-${index}`)),
    employeeId: toIdNumber(empNo, String(empNo)),
    employeeName: dto.emp_name ?? dto.empName ?? String(empNo),
    department: dto.dept_name ?? dto.deptName ?? dto.dept_code ?? dto.deptCode ?? '-',
    position: dto.rank_name ?? dto.rankName ?? dto.rank_code ?? dto.rankCode ?? '-',
    date,
    checkIn: dto.check_in ?? dto.checkIn,
    checkOut: dto.check_out ?? dto.checkOut,
    events: codeId ? [{ codeId, detail }] : [],
    memo: detail,
    isHoliday: toApiBoolean(dto.is_holiday ?? dto.isHoliday),
    holidayName: dto.holiday_name ?? dto.holidayName,
    isShiftWorker: toApiBoolean(dto.is_shift_worker ?? dto.isShiftWorker),
  };
};

export const adaptStatisticsRecordsToEmployees = (
  records: AttendanceRecord[],
): ReportEmployee[] => {
  const employeeMap = new Map<number, ReportEmployee>();

  records.forEach((record) => {
    if (!employeeMap.has(record.employeeId)) {
      employeeMap.set(record.employeeId, {
        id: record.employeeId,
        name: record.employeeName,
        department: record.department,
        position: record.position,
        shiftWorker: record.isShiftWorker,
      });
    }
  });

  return [...employeeMap.values()].sort((a, b) =>
    a.department.localeCompare(b.department, 'ko') || a.name.localeCompare(b.name, 'ko'));
};
