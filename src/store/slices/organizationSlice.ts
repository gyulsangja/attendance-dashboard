import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { organizationChanges, staffs, shiftWorkers } from '@/mocks';

export const UNASSIGNED_TEAM_ID = 'unassigned';
export const UNASSIGNED_TEAM_NAME = '미소속';

export type OrganizationTeam = {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
};

export type OrganizationEmployee = {
  id: number;
  name: string;
  teamId: string;
  position: string;
  jobTitle: string;
  shiftWorker: boolean;
  startDate: string;
  endDate?: string;
};

export type OrganizationHistory = {
  id: string;
  effectiveDate: string;
  category: '조직' | '구성원';
  targetName: string;
  changeType: string;
  detail: string;
  entityId?: string;
  beforeTeam?: OrganizationTeam;
  beforeEmployee?: OrganizationEmployee;
};

type OrganizationState = {
  teams: OrganizationTeam[];
  employees: OrganizationEmployee[];
  history: OrganizationHistory[];
};

const shiftWorkerIds = new Set(shiftWorkers.map((worker) => worker.employeeId));
const latestOrganizationChange = (employeeId: number) => organizationChanges
  .filter((change) => change.employeeId === employeeId)
  .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))[0];

const initialState: OrganizationState = {
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
      category: '구성원',
      targetName: '윤지수',
      changeType: '부서 이동',
      detail: '개발팀 → 기술팀',
      entityId: '3',
      beforeEmployee: {
        id: 3,
        name: '윤지수',
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
      category: '구성원',
      targetName: '장유진',
      changeType: '입사',
      detail: '기술팀 · 사원 · 기술지원',
    },
    {
      id: 'history-1',
      effectiveDate: '2024-01-01',
      category: '조직',
      targetName: '전체 조직',
      changeType: '조직 구성',
      detail: '초기 조직 및 구성원 등록',
    },
  ],
};

const addHistory = (
  state: OrganizationState,
  history: Omit<OrganizationHistory, 'id'>,
) => {
  state.history.unshift({
    ...history,
    id: `history-${Date.now()}-${state.history.length}`,
  });
};

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    addTeam(state, action: PayloadAction<OrganizationTeam>) {
      state.teams.push(action.payload);
      addHistory(state, {
        effectiveDate: action.payload.startDate,
        category: '조직',
        targetName: action.payload.name,
        changeType: '팀 생성',
        detail: `${action.payload.startDate}부터 조직 운영`,
        entityId: action.payload.id,
      });
    },
    updateTeam(
      state,
      action: PayloadAction<{ team: OrganizationTeam; effectiveDate: string }>,
    ) {
      const team = state.teams.find((item) => item.id === action.payload.team.id);
      if (team) {
        const previousName = team.name;
        Object.assign(team, action.payload.team);
        addHistory(state, {
          effectiveDate: action.payload.effectiveDate,
          category: '조직',
          targetName: action.payload.team.name,
          changeType: '팀 정보 변경',
          detail: `${previousName} → ${action.payload.team.name}`,
          entityId: team.id,
          beforeTeam: { ...team, name: previousName },
        });
      }
    },
    deleteTeam(state, action: PayloadAction<{ id: string; effectiveDate: string }>) {
      const team = state.teams.find((item) => item.id === action.payload.id);
      if (!team) return;
      team.endDate = action.payload.effectiveDate;
      addHistory(state, {
        effectiveDate: action.payload.effectiveDate,
        category: '조직',
        targetName: team.name,
        changeType: '팀 종료',
        detail: `${action.payload.effectiveDate}부터 운영 종료`,
        entityId: team.id,
        beforeTeam: { ...team, endDate: undefined },
      });
    },
    addEmployee(state, action: PayloadAction<OrganizationEmployee>) {
      state.employees.push(action.payload);
      const team = state.teams.find((item) => item.id === action.payload.teamId);
      addHistory(state, {
        effectiveDate: action.payload.startDate,
        category: '구성원',
        targetName: action.payload.name,
        changeType: '입사',
        detail: `${action.payload.teamId === UNASSIGNED_TEAM_ID ? UNASSIGNED_TEAM_NAME : team?.name ?? '-'} · ${action.payload.position} · ${action.payload.jobTitle}`,
        entityId: String(action.payload.id),
      });
    },
    updateEmployee(
      state,
      action: PayloadAction<{ employee: OrganizationEmployee; effectiveDate: string }>,
    ) {
      const index = state.employees.findIndex((item) => item.id === action.payload.employee.id);
      if (index < 0) return;
      const previous = state.employees[index];
      const previousTeam = previous.teamId === UNASSIGNED_TEAM_ID
        ? UNASSIGNED_TEAM_NAME
        : state.teams.find((item) => item.id === previous.teamId)?.name ?? '-';
      const nextTeam = action.payload.employee.teamId === UNASSIGNED_TEAM_ID
        ? UNASSIGNED_TEAM_NAME
        : state.teams.find((item) => item.id === action.payload.employee.teamId)?.name ?? '-';
      const changes = [
        previousTeam !== nextTeam ? `부서 ${previousTeam} → ${nextTeam}` : '',
        previous.position !== action.payload.employee.position
          ? `직위 ${previous.position} → ${action.payload.employee.position}`
          : '',
        previous.jobTitle !== action.payload.employee.jobTitle
          ? `직무 ${previous.jobTitle} → ${action.payload.employee.jobTitle}`
          : '',
        previous.shiftWorker !== action.payload.employee.shiftWorker
          ? `교대근무 ${action.payload.employee.shiftWorker ? '지정' : '해제'}`
          : '',
      ].filter(Boolean);
      state.employees[index] = action.payload.employee;
      addHistory(state, {
        effectiveDate: action.payload.effectiveDate,
        category: '구성원',
        targetName: action.payload.employee.name,
        changeType: '정보 변경',
        detail: changes.join(', ') || '기본 정보 수정',
        entityId: String(action.payload.employee.id),
        beforeEmployee: { ...previous },
      });
    },
    deleteEmployee(
      state,
      action: PayloadAction<{ id: number; effectiveDate: string }>,
    ) {
      const employee = state.employees.find((item) => item.id === action.payload.id);
      if (!employee) return;
      employee.endDate = action.payload.effectiveDate;
      addHistory(state, {
        effectiveDate: action.payload.effectiveDate,
        category: '구성원',
        targetName: employee.name,
        changeType: '퇴사',
        detail: `${action.payload.effectiveDate}부터 재직 종료`,
        entityId: String(employee.id),
        beforeEmployee: { ...employee, endDate: undefined },
      });
    },
  },
});

export const {
  addTeam,
  updateTeam,
  deleteTeam,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} = organizationSlice.actions;

export default organizationSlice.reducer;

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
      if (item.category === '조직') {
        if (item.changeType === '팀 생성') teamMap.delete(item.entityId!);
        else if (item.beforeTeam) teamMap.set(item.beforeTeam.id, { ...item.beforeTeam });
      } else {
        const employeeId = Number(item.entityId);
        if (item.changeType === '입사') employeeMap.delete(employeeId);
        else if (item.beforeEmployee) {
          employeeMap.set(item.beforeEmployee.id, { ...item.beforeEmployee });
        }
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
