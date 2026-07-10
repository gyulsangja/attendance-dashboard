import type { EmployeeAttendDto } from '@/api/dto/employee.dto';
import type { OperationSchedule } from '@/types/domain';

const toNumericId = (value: string) => {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric;

  return value
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
};

const getScheduleId = (dto: EmployeeAttendDto) => {
  const date = dto.attend_date ?? dto.attendDate ?? '';
  const employeeId = dto.emp_no ?? dto.empNo ?? '';
  const code = dto.attend_code ?? dto.attendCode ?? dto.detail_code ?? dto.detailCode ?? '';

  return Number(dto.id ?? dto.idx) || toNumericId(`${employeeId}-${date}-${code}`);
};

const getEmployeeId = (dto: EmployeeAttendDto) =>
  Number(dto.emp_no ?? dto.empNo) || toNumericId(String(dto.emp_no ?? dto.empNo ?? ''));

const getEmployeeNo = (dto: EmployeeAttendDto) => {
  const value = dto.emp_no ?? dto.empNo;
  return value === undefined || value === null ? undefined : String(value);
};

export const adaptEmployeeAttendDtoToOperationSchedule = (
  dto: EmployeeAttendDto,
): OperationSchedule => {
  const codeId = dto.attend_code ?? dto.attendCode ?? dto.detail_code ?? dto.detailCode ?? '';
  const codeName = dto.attend_code_name
    ?? dto.attendCodeName
    ?? dto.attend_name
    ?? dto.attendName
    ?? dto.detail_code_name
    ?? dto.detailCodeName
    ?? dto.attend_reason
    ?? dto.attendReason
    ?? codeId;
  const date = dto.attend_date ?? dto.attendDate ?? '';

  return {
    id: getScheduleId(dto),
    date,
    department: dto.dept_name ?? dto.deptName ?? dto.dept_code ?? dto.deptCode ?? '-',
    employeeId: getEmployeeId(dto),
    employeeNo: getEmployeeNo(dto),
    name: dto.emp_name ?? dto.empName ?? '-',
    codeId,
    type: codeName,
    detail: dto.memo ?? dto.remark ?? '',
  };
};

export const adaptOperationScheduleToEmployeeAttendDto = (
  schedule: OperationSchedule,
  options: { includeId?: boolean } = {},
): EmployeeAttendDto => ({
  ...(options.includeId ? { idx: schedule.id } : {}),
  emp_no: schedule.employeeNo ?? schedule.employeeId,
  attend_date: schedule.date,
  detail_code: schedule.codeId,
  attend_reason: schedule.type,
  etc: schedule.detail,
});
