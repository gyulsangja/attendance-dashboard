import type {
  OrganizationEmployee,
  OrganizationHistory,
  OrganizationTeam,
} from '@/types/domain';
import {
  ORGANIZATION_CATEGORY,
  ORGANIZATION_CHANGE_TYPES,
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
} from './organizationConstants';

export const getTeamName = (
  teams: OrganizationTeam[],
  teamId: string,
) => teamId === UNASSIGNED_TEAM_ID
  ? UNASSIGNED_TEAM_NAME
  : teams.find((item) => item.id === teamId)?.name ?? '-';

export const getOrganizationSnapshot = (
  teams: OrganizationTeam[],
  employees: OrganizationEmployee[],
  history: OrganizationHistory[],
  date: string,
) => {
  const teamMap = new Map(teams.map((team) => [team.id, { ...team }]));
  const employeeMap = new Map(employees.map((employee) => [employee.id, { ...employee }]));

  [...history]
    .filter((item) => item.effectiveDate > date && item.entityId)
    .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))
    .forEach((item) => {
      if (item.category === ORGANIZATION_CATEGORY) {
        if (item.changeType === ORGANIZATION_CHANGE_TYPES.TEAM_CREATED) {
          teamMap.delete(item.entityId!);
        } else if (item.beforeTeam) {
          teamMap.set(item.beforeTeam.id, { ...item.beforeTeam });
        }
        return;
      }

      const employeeId = Number(item.entityId);
      if (item.changeType === ORGANIZATION_CHANGE_TYPES.EMPLOYEE_JOINED) {
        employeeMap.delete(employeeId);
      } else if (item.beforeEmployee) {
        employeeMap.set(item.beforeEmployee.id, { ...item.beforeEmployee });
      }
    });

  return {
    teams: [...teamMap.values()].filter(
      (team) => team.startDate <= date && (!team.endDate || team.endDate > date),
    ),
    employees: [...employeeMap.values()].filter(
      (employee) => employee.startDate <= date && (!employee.endDate || employee.endDate > date),
    ),
  };
};
