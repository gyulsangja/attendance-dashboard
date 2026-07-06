import type { EmployeeDto } from '@/api/dto/employee.dto';
import type { CommonCodeLookup } from '@/adapters/commonCodeAdapter';
import type { OrganizationEmployee, ReportEmployee } from '@/types/domain';

const getEmployeeId = (dto: EmployeeDto) => Number(dto.emp_no ?? dto.empNo ?? 0);
const getEmployeeName = (dto: EmployeeDto) => dto.emp_name ?? dto.empName ?? dto.name ?? '-';
const getDepartment = (dto: EmployeeDto) =>
  dto.dept_code ?? dto.deptCode ?? dto.dept_name ?? dto.deptName ?? dto.department ?? '-';
const getDepartmentLabel = (dto: EmployeeDto, lookup: CommonCodeLookup) => {
  const code = dto.dept_code ?? dto.deptCode ?? '';
  const fallback = dto.dept_name ?? dto.deptName ?? dto.department ?? code ?? '-';
  return lookup.getLabelInGroup('G_TEAM_CODE', code, fallback);
};
const getPosition = (dto: EmployeeDto) =>
  dto.rank_code ?? dto.rankCode ?? dto.rank_name ?? dto.rankName ?? dto.position ?? '-';
const getPositionLabel = (dto: EmployeeDto, lookup: CommonCodeLookup) => {
  const code = dto.rank_code ?? dto.rankCode ?? '';
  const fallback = dto.rank_name ?? dto.rankName ?? dto.position ?? code ?? '-';
  return lookup.getLabelInGroup('G_RANK_CODE', code, fallback);
};
const getJobTitle = (dto: EmployeeDto) =>
  dto.work_type_code ?? dto.workTypeCode ?? dto.work_type_name ?? dto.workTypeName ?? dto.job_title ?? dto.jobTitle ?? '';
const getJobTitleLabel = (dto: EmployeeDto, lookup: CommonCodeLookup) => {
  const code = dto.work_type_code ?? dto.workTypeCode ?? '';
  const fallback = dto.work_type_name ?? dto.workTypeName ?? dto.job_title ?? dto.jobTitle ?? code ?? '';
  return lookup.getLabelInGroup('G_WORK_TYPE', code, fallback);
};
const getHoldStatusCode = (dto: EmployeeDto) => dto.hold_stat_code ?? dto.holdStatCode ?? '';
const getHoldStatusLabel = (dto: EmployeeDto, lookup: CommonCodeLookup) => {
  const code = getHoldStatusCode(dto);
  const fallback = dto.hold_stat_name ?? dto.holdStatName ?? code;
  return lookup.getLabelInGroup('G_HOLD_STATUS', code, fallback);
};
const isShiftWorker = (dto: EmployeeDto) => {
  const shiftValue = dto.shift_yn ?? dto.shiftYn ?? dto.work_type_code ?? dto.workTypeCode ?? 'N';
  return ['Y', 'SHIFT', 'SHIFT_WORK', 'SHIFTWORK', '교대'].includes(String(shiftValue).trim().toUpperCase());
};

const fallbackLookup: CommonCodeLookup = {
  getLabel: (_detailCode, fallback = '-') => fallback,
  getLabelInGroup: (_groupCode, _detailCode, fallback = '-') => fallback,
};

export const adaptEmployeeDtoToReportEmployee = (
  dto: EmployeeDto,
  lookup: CommonCodeLookup = fallbackLookup,
): ReportEmployee => ({
  id: getEmployeeId(dto),
  name: getEmployeeName(dto),
  department: lookup.getLabelInGroup('G_TEAM_CODE', getDepartment(dto), getDepartment(dto)),
  position: lookup.getLabelInGroup('G_RANK_CODE', getPosition(dto), getPosition(dto)),
});

export const adaptEmployeeDtoToOrganizationEmployee = (
  dto: EmployeeDto,
  lookup: CommonCodeLookup = fallbackLookup,
): OrganizationEmployee => ({
  id: getEmployeeId(dto),
  name: getEmployeeName(dto),
  teamId: getDepartment(dto),
  position: getPositionLabel(dto, lookup),
  jobTitle: getJobTitleLabel(dto, lookup),
  shiftWorker: isShiftWorker(dto),
  startDate: dto.hire_date ?? dto.hireDate ?? '2024-01-01',
  endDate: dto.retire_date ?? dto.retireDate,
  backendDeptCode: getDepartment(dto),
  backendDeptName: getDepartmentLabel(dto, lookup),
  backendRankCode: getPosition(dto),
  backendRankName: getPositionLabel(dto, lookup),
  backendWorkTypeCode: getJobTitle(dto),
  backendWorkTypeName: getJobTitleLabel(dto, lookup),
  backendHoldStatusCode: getHoldStatusCode(dto),
  backendHoldStatusName: getHoldStatusLabel(dto, lookup),
});

export const adaptOrganizationEmployeeToEmployeeDto = (
  employee: OrganizationEmployee,
): EmployeeDto => ({
  emp_company: 'LX',
  emp_no: employee.id,
  emp_name: employee.name,
  dept_code: employee.backendDeptCode ?? employee.teamId,
  rank_code: employee.backendRankCode ?? employee.position,
  work_type_code: employee.backendWorkTypeCode ?? employee.jobTitle,
  hold_stat_code: employee.backendHoldStatusCode ?? 'TEE1',
  email: '',
  phone_no: '',
  hire_date: employee.startDate,
  retire_date: employee.endDate,
  shift_yn: employee.shiftWorker ? 'Y' : 'N',
  etc: '',
});

