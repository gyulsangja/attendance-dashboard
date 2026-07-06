import type { AttendanceManagerDto } from '@/api/dto/attendance.dto';
import type { AttendanceRecord } from '@/types/domain';

const toNumericId = (value: string) => {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric;

  return value
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
};

const isNumericValue = (value: unknown) =>
  value !== undefined && value !== null && Number.isFinite(Number(value));

const getEmployeeKey = (dto: AttendanceManagerDto) =>
  String(dto.emp_no ?? dto.empNo ?? dto.emo_no ?? dto.attend_card_no ?? dto.attendCardNo ?? '');

const getRecordId = (dto: AttendanceManagerDto) =>
  Number(dto.id ?? dto.idx)
  || toNumericId(`${getEmployeeKey(dto)}-${getDate(dto)}`);

const getEmployeeId = (dto: AttendanceManagerDto) =>
  toNumericId(getEmployeeKey(dto));

const getEmployeeName = (dto: AttendanceManagerDto) => {
  const fallbackName = dto.emp_no ?? dto.empNo ?? dto.emo_no ?? '';
  if (dto.emp_name ?? dto.empName) return dto.emp_name ?? dto.empName ?? '-';
  return isNumericValue(fallbackName) ? '-' : String(fallbackName || '-');
};

const getDate = (dto: AttendanceManagerDto) =>
  dto.attend_record_date ??
  dto.attendRecordDate ??
  dto.attend_date ??
  dto.attendDate ??
  dto.work_date ??
  dto.workDate ??
  '';

export const adaptAttendanceManagerDtoToRecord = (
  dto: AttendanceManagerDto,
): AttendanceRecord => {
  const codeId =
    dto.attend_code ?? dto.attendCode ?? dto.detail_code ?? dto.detailCode;
  const detail =
    dto.attend_code_name ?? dto.attendCodeName ?? dto.attend_reason ?? dto.attendReason ?? dto.remark ?? dto.memo ?? dto.etc ?? '';

  return {
    id: getRecordId(dto),
    employeeId: getEmployeeId(dto),
    employeeName: getEmployeeName(dto),
    department: dto.dept_name ?? dto.deptName ?? dto.dept_code ?? dto.deptCode ?? '-',
    position: dto.rank_name ?? dto.rankName ?? dto.position ?? dto.rank_code ?? dto.rankCode ?? '-',
    date: getDate(dto),
    checkIn: dto.check_in ?? dto.checkIn ?? dto.attendance_time ?? dto.attendanceTime,
    checkOut: dto.check_out ?? dto.checkOut ?? dto.leave_working_time ?? dto.leaveWorkingTime,
    events: codeId ? [{ codeId, detail }] : [],
    memo: dto.memo ?? dto.remark ?? dto.attend_reason ?? dto.attendReason ?? dto.etc,
  };
};
export const adaptAttendanceRecordToManagerDto = (
  record: AttendanceRecord,
): AttendanceManagerDto => ({
  id: record.id,
  emp_no: record.employeeId,
  emp_name: record.employeeName,
  dept_name: record.department,
  rank_name: record.position,
  attend_date: record.date,
  attend_record_date: record.date,
  check_in: record.checkIn,
  check_out: record.checkOut,
  attend_code: record.events[0]?.codeId ?? '',
  detail_code: record.events[0]?.codeId ?? '',
  attend_reason: record.events.map((event) => event.detail).filter(Boolean).join(', '),
  attend_codes: record.events.map((event) => event.codeId),
  attendance_codes: record.events.map((event) => event.codeId),
  memo: record.memo,
  etc: record.events.map((event) => event.codeId).join(','),
});
