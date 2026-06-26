import type { EmployeeDto } from '@/api/dto/employee.dto';
import type { CommonCodeLookup } from '@/adapters/commonCodeAdapter';
import type { OrganizationEmployee, ReportEmployee } from '@/types/domain';

const getEmployeeId = (dto: EmployeeDto) => Number(dto.emp_no ?? dto.empNo ?? 0);
const getEmployeeName = (dto: EmployeeDto) => dto.emp_name ?? dto.empName ?? dto.name ?? '-';
const getDepartment = (dto: EmployeeDto) =>
  dto.dept_name ?? dto.deptName ?? dto.department ?? dto.dept_code ?? dto.deptCode ?? '-';
const getPosition = (dto: EmployeeDto) => dto.position ?? dto.rank_code ?? dto.rankCode ?? '-';
const getJobTitle = (dto: EmployeeDto) =>
  dto.job_title ?? dto.jobTitle ?? dto.work_type_code ?? dto.workTypeCode ?? '';
const getHoldStatusCode = (dto: EmployeeDto) => dto.hold_stat_code ?? dto.holdStatCode ?? '';
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
  teamId: lookup.getLabelInGroup('G_TEAM_CODE', getDepartment(dto), getDepartment(dto)),
  position: lookup.getLabelInGroup('G_RANK_CODE', getPosition(dto), getPosition(dto)),
  jobTitle: lookup.getLabelInGroup('G_WORK_TYPE', getJobTitle(dto), getJobTitle(dto)),
  shiftWorker: isShiftWorker(dto),
  startDate: dto.hire_date ?? dto.hireDate ?? '2024-01-01',
  endDate: dto.retire_date ?? dto.retireDate,
  backendDeptCode: getDepartment(dto),
  backendRankCode: getPosition(dto),
  backendWorkTypeCode: getJobTitle(dto),
  backendHoldStatusCode: getHoldStatusCode(dto),
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

