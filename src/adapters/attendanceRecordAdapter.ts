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
  String(dto.attend_card_no ?? dto.attendCardNo ?? dto.emp_no ?? dto.empNo ?? dto.emo_no ?? '');

const getRecordId = (dto: AttendanceManagerDto) =>
  Number(dto.id ?? dto.idx)
  || toNumericId(`${getEmployeeKey(dto)}-${getDate(dto)}`);

const getEmployeeId = (dto: AttendanceManagerDto) =>
  toNumericId(getEmployeeKey(dto));

const getEmployeeName = (dto: AttendanceManagerDto) => {
  const fallbackName = dto.emp_no ?? dto.empNo ?? dto.emo_no ?? '';
  if (dto.emp_name ?? dto.empName) return dto.emp_name ?? dto.empName ?? '-';
  if (dto.attend_card_no ?? dto.attendCardNo) return String(fallbackName || '-');
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

const normalizeTime = (value?: string) => {
  if (!value) return undefined;
  const [hour, minute] = value.split(':');
  if (!hour || !minute) return value;
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
};

const getWorkingMinutes = (checkIn?: string, checkOut?: string) => {
  if (!checkIn || !checkOut) return 0;

  const [inHour, inMinute] = checkIn.split(':').map(Number);
  const [outHour, outMinute] = checkOut.split(':').map(Number);
  if (
    !Number.isFinite(inHour)
    || !Number.isFinite(inMinute)
    || !Number.isFinite(outHour)
    || !Number.isFinite(outMinute)
  ) {
    return 0;
  }

  const start = inHour * 60 + inMinute;
  const end = outHour * 60 + outMinute;
  return end >= start ? end - start : end + 24 * 60 - start;
};

const formatWorkingTime = (checkIn?: string, checkOut?: string) => {
  const minutes = getWorkingMinutes(checkIn, checkOut);
  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(remainMinutes).padStart(2, '0')}`;
};

export const adaptAttendanceManagerDtoToRecord = (
  dto: AttendanceManagerDto,
): AttendanceRecord => {
  const codeId =
    dto.attend_status
    ?? dto.attendStatus
    ?? dto.attend_code
    ?? dto.attendCode
    ?? dto.attendance_code
    ?? dto.attendanceCode
    ?? dto.detail_code
    ?? dto.detailCode
    ?? dto.attendance_name
    ?? dto.attendanceName;
  const detail =
    dto.attend_status_name
    ?? dto.attendStatusName
    ?? dto.attend_code_name
    ?? dto.attendCodeName
    ?? dto.attendance_name
    ?? dto.attendanceName
    ?? dto.attend_reason
    ?? dto.attendReason
    ?? dto.remark
    ?? dto.memo
    ?? dto.etc
    ?? '';

  return {
    id: getRecordId(dto),
    employeeId: getEmployeeId(dto),
    employeeName: getEmployeeName(dto),
    department: dto.dept_name ?? dto.deptName ?? dto.dept_code ?? dto.deptCode ?? '-',
    position: dto.rank_name ?? dto.rankName ?? dto.position ?? dto.rank_code ?? dto.rankCode ?? '-',
    date: getDate(dto),
    checkIn: normalizeTime(dto.check_in ?? dto.checkIn ?? dto.attendance_time ?? dto.attendanceTime),
    checkOut: normalizeTime(dto.check_out ?? dto.checkOut ?? dto.leave_working_time ?? dto.leaveWorkingTime),
    events: codeId ? [{ codeId, detail }] : [],
    memo: dto.memo ?? dto.remark ?? dto.attend_reason ?? dto.attendReason ?? dto.etc,
  };
};
export const adaptAttendanceRecordToManagerDto = (
  record: AttendanceRecord,
): AttendanceManagerDto => {
  const checkIn = normalizeTime(record.checkIn);
  const checkOut = normalizeTime(record.checkOut);
  const employeeKey = String(record.employeeId);
  const attendanceCode = record.events[0]?.codeId ?? '';

  return {
    year: record.year,
    month: record.month,
    week: record.week,
    idx: String(record.id),
    attend_date: record.date,
    attend_card_no: employeeKey,
    emp_no: employeeKey,
    attendance_time: checkIn ?? '',
    leave_working_time: checkOut ?? '',
    total_working: formatWorkingTime(checkIn, checkOut),
    attendance_code: attendanceCode,
    etc: record.memo ?? '',
  };
};
