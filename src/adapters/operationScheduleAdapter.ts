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

export const adaptEmployeeAttendDtoToOperationSchedule = (
  dto: EmployeeAttendDto,
): OperationSchedule => {
  const codeId = dto.attend_code ?? dto.attendCode ?? dto.detail_code ?? dto.detailCode ?? '';
  const codeName = dto.attend_code_name ?? dto.attendCodeName ?? dto.detail_code_name ?? dto.detailCodeName ?? codeId;
  const date = dto.attend_date ?? dto.attendDate ?? '';

  return {
    id: getScheduleId(dto),
    date,
    department: dto.dept_name ?? dto.deptName ?? dto.dept_code ?? dto.deptCode ?? '-',
    employeeId: getEmployeeId(dto),
    name: dto.emp_name ?? dto.empName ?? '-',
    codeId,
    type: codeName,
    detail: dto.memo ?? dto.remark ?? '',
  };
};

export const adaptOperationScheduleToEmployeeAttendDto = (
  schedule: OperationSchedule,
): EmployeeAttendDto => ({
  id: schedule.id,
  emp_no: schedule.employeeId,
  emp_name: schedule.name,
  dept_name: schedule.department,
  attend_date: schedule.date,
  attend_code: schedule.codeId,
  detail_code: schedule.codeId,
  remark: schedule.detail,
  memo: schedule.detail,
});
