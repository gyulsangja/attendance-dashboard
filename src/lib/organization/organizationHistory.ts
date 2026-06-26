import type {
  OrganizationEmployee,
  OrganizationHistory,
  OrganizationTeam,
} from '@/types/domain';
import {
  EMPLOYEE_CATEGORY,
  ORGANIZATION_CATEGORY,
  ORGANIZATION_CHANGE_TYPES,
} from './organizationConstants';
import { getTeamName } from './organizationSnapshot';

type HistoryState = {
  teams: OrganizationTeam[];
  history: OrganizationHistory[];
};

type HistoryDraft = Omit<OrganizationHistory, 'id'>;

export const addOrganizationHistory = (
  state: HistoryState,
  history: Omit<OrganizationHistory, 'id'>,
) => {
  state.history.unshift({
    ...history,
    id: `history-${Date.now()}-${state.history.length}`,
  });
};

export const buildTeamCreatedHistory = (team: OrganizationTeam) => ({
  effectiveDate: team.startDate,
  category: ORGANIZATION_CATEGORY,
  targetName: team.name,
  changeType: ORGANIZATION_CHANGE_TYPES.TEAM_CREATED,
  detail: `${team.startDate}부터 조직 운영`,
  entityId: team.id,
}) satisfies HistoryDraft;

export const buildTeamUpdatedHistory = (
  team: OrganizationTeam,
  previousName: string,
  effectiveDate: string,
) => ({
  effectiveDate,
  category: ORGANIZATION_CATEGORY,
  targetName: team.name,
  changeType: ORGANIZATION_CHANGE_TYPES.TEAM_UPDATED,
  detail: `${previousName} -> ${team.name}`,
  entityId: team.id,
  beforeTeam: { ...team, name: previousName },
}) satisfies HistoryDraft;

export const buildTeamEndedHistory = (
  team: OrganizationTeam,
  effectiveDate: string,
) => ({
  effectiveDate,
  category: ORGANIZATION_CATEGORY,
  targetName: team.name,
  changeType: ORGANIZATION_CHANGE_TYPES.TEAM_ENDED,
  detail: `${effectiveDate}부터 운영 종료`,
  entityId: team.id,
  beforeTeam: { ...team, endDate: undefined },
}) satisfies HistoryDraft;

export const buildEmployeeJoinedHistory = (
  teams: OrganizationTeam[],
  employee: OrganizationEmployee,
) => ({
  effectiveDate: employee.startDate,
  category: EMPLOYEE_CATEGORY,
  targetName: employee.name,
  changeType: ORGANIZATION_CHANGE_TYPES.EMPLOYEE_JOINED,
  detail: `${getTeamName(teams, employee.teamId)} · ${employee.position} · ${employee.jobTitle}`,
  entityId: String(employee.id),
}) satisfies HistoryDraft;

export const buildEmployeeUpdatedHistory = (
  teams: OrganizationTeam[],
  previous: OrganizationEmployee,
  employee: OrganizationEmployee,
  effectiveDate: string,
) => {
  const previousTeam = getTeamName(teams, previous.teamId);
  const nextTeam = getTeamName(teams, employee.teamId);
  const changes = [
    previousTeam !== nextTeam ? `부서 ${previousTeam} -> ${nextTeam}` : '',
    previous.position !== employee.position ? `직위 ${previous.position} -> ${employee.position}` : '',
    previous.jobTitle !== employee.jobTitle ? `직무 ${previous.jobTitle} -> ${employee.jobTitle}` : '',
    previous.shiftWorker !== employee.shiftWorker
      ? `교대근무 ${employee.shiftWorker ? '지정' : '해제'}`
      : '',
  ].filter(Boolean);

  return {
    effectiveDate,
    category: EMPLOYEE_CATEGORY,
    targetName: employee.name,
    changeType: ORGANIZATION_CHANGE_TYPES.EMPLOYEE_UPDATED,
    detail: changes.join(', ') || '기본 정보 수정',
    entityId: String(employee.id),
    beforeEmployee: { ...previous },
  } satisfies HistoryDraft;
};

export const buildEmployeeLeftHistory = (
  employee: OrganizationEmployee,
  effectiveDate: string,
) => ({
  effectiveDate,
  category: EMPLOYEE_CATEGORY,
  targetName: employee.name,
  changeType: ORGANIZATION_CHANGE_TYPES.EMPLOYEE_LEFT,
  detail: `${effectiveDate}부터 재직 종료`,
  entityId: String(employee.id),
  beforeEmployee: { ...employee, endDate: undefined },
}) satisfies HistoryDraft;
