import type { OrganizationEmployee } from '@/types/domain';
import { UNASSIGNED_TEAM_ID } from './organizationConstants';

export const EMPLOYEE_GROUP_IDS = {
  LEAVE: 'employee-group-leave',
  RETIRED: 'employee-group-retired',
} as const;

export const EMPLOYEE_GROUP_NAMES = {
  [UNASSIGNED_TEAM_ID]: '미소속',
  [EMPLOYEE_GROUP_IDS.LEAVE]: '휴직',
  [EMPLOYEE_GROUP_IDS.RETIRED]: '퇴사',
} as const;

const normalize = (value?: string) => (value ?? '').trim().toUpperCase();

export const isLeaveEmployee = (employee: OrganizationEmployee) => {
  const code = normalize(employee.backendHoldStatusCode);
  const name = employee.backendHoldStatusName ?? '';
  return code.includes('LEAVE') || name.includes('휴직');
};

export const isRetiredEmployee = (employee: OrganizationEmployee) => {
  const code = normalize(employee.backendHoldStatusCode);
  const name = employee.backendHoldStatusName ?? '';
  return code.includes('RETIRED') || code.includes('RETIRE') || name.includes('퇴사') || name.includes('퇴직');
};

export const isUnassignedEmployee = (employee: OrganizationEmployee) =>
  !employee.teamId
  || employee.teamId === UNASSIGNED_TEAM_ID
  || employee.teamId === '-'
  || employee.backendDeptCode === '-';

export const getEmployeeOrganizationGroupId = (employee: OrganizationEmployee) => {
  if (isRetiredEmployee(employee)) return EMPLOYEE_GROUP_IDS.RETIRED;
  if (isLeaveEmployee(employee)) return EMPLOYEE_GROUP_IDS.LEAVE;
  if (isUnassignedEmployee(employee)) return UNASSIGNED_TEAM_ID;
  return employee.teamId;
};

export const getEmployeeOrganizationGroupName = (
  employee: OrganizationEmployee,
  teamName?: string,
) => EMPLOYEE_GROUP_NAMES[getEmployeeOrganizationGroupId(employee) as keyof typeof EMPLOYEE_GROUP_NAMES]
  ?? teamName
  ?? employee.backendDeptName
  ?? employee.teamId
  ?? '-';
