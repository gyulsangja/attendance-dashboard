import { organizationChanges, staffs, shiftWorkers } from '@/mocks';
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

export type OrganizationState = {
  teams: OrganizationTeam[];
  employees: OrganizationEmployee[];
  history: OrganizationHistory[];
};

const shiftWorkerIds = new Set(shiftWorkers.map((worker) => worker.employeeId));

const latestOrganizationChange = (employeeId: number) => organizationChanges
  .filter((change) => change.employeeId === employeeId)
  .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))[0];

export const buildInitialOrganizationState = (): OrganizationState => ({
  teams: staffs.map((team) => ({
    id: team.team,
    name: team.teamTitle,
    startDate: '2024-01-01',
  })),
  employees: staffs.flatMap((team) =>
    team.staff.map((employee) => ({
      id: employee.id,
      name: employee.name,
      teamId: latestOrganizationChange(employee.id)?.toTeamId ?? team.team,
      position: employee.position,
      jobTitle: employee.jobTitle,
      shiftWorker: shiftWorkerIds.has(employee.id),
      startDate: '2024-01-01',
    })),
  ),
  history: [
    {
      id: 'history-3',
      effectiveDate: '2026-06-14',
      category: EMPLOYEE_CATEGORY,
      targetName: '오준서',
      changeType: '부서 이동',
      detail: '개발팀 -> 기술팀',
      entityId: '3',
      beforeEmployee: {
        id: 3,
        name: '오준서',
        teamId: 'dev',
        position: '사원',
        jobTitle: '개발자',
        shiftWorker: false,
        startDate: '2024-01-01',
      },
    },
    {
      id: 'history-2',
      effectiveDate: '2025-03-03',
      category: EMPLOYEE_CATEGORY,
      targetName: '송유진',
      changeType: ORGANIZATION_CHANGE_TYPES.EMPLOYEE_JOINED,
      detail: '기술팀 · 사원 · 기술지원',
    },
    {
      id: 'history-1',
      effectiveDate: '2024-01-01',
      category: ORGANIZATION_CATEGORY,
      targetName: '전체 조직',
      changeType: ORGANIZATION_CHANGE_TYPES.INITIAL,
      detail: '초기 조직 및 구성원 등록',
    },
  ],
});
