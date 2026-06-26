import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  addOrganizationHistory,
  buildEmployeeJoinedHistory,
  buildEmployeeLeftHistory,
  buildEmployeeUpdatedHistory,
  buildTeamCreatedHistory,
  buildTeamEndedHistory,
  buildTeamUpdatedHistory,
} from '@/lib/organization/organizationHistory';
import { buildInitialOrganizationState } from '@/lib/organization/organizationInitialState';
import type {
  OrganizationEmployee,
  OrganizationTeam,
} from '@/types/domain';

export {
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
} from '@/lib/organization/organizationConstants';
export { getOrganizationSnapshot } from '@/lib/organization/organizationSnapshot';
export type {
  OrganizationEmployee,
  OrganizationHistory,
  OrganizationTeam,
} from '@/types/domain';

const initialState = buildInitialOrganizationState();

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    addTeam(state, action: PayloadAction<OrganizationTeam>) {
      state.teams.push(action.payload);
      addOrganizationHistory(state, buildTeamCreatedHistory(action.payload));
    },
    updateTeam(
      state,
      action: PayloadAction<{ team: OrganizationTeam; effectiveDate: string }>,
    ) {
      const team = state.teams.find((item) => item.id === action.payload.team.id);
      if (!team) return;

      const previousName = team.name;
      Object.assign(team, action.payload.team);
      addOrganizationHistory(
        state,
        buildTeamUpdatedHistory(team, previousName, action.payload.effectiveDate),
      );
    },
    deleteTeam(state, action: PayloadAction<{ id: string; effectiveDate: string }>) {
      const team = state.teams.find((item) => item.id === action.payload.id);
      if (!team) return;

      team.endDate = action.payload.effectiveDate;
      addOrganizationHistory(
        state,
        buildTeamEndedHistory(team, action.payload.effectiveDate),
      );
    },
    addEmployee(state, action: PayloadAction<OrganizationEmployee>) {
      state.employees.push(action.payload);
      addOrganizationHistory(
        state,
        buildEmployeeJoinedHistory(state.teams, action.payload),
      );
    },
    updateEmployee(
      state,
      action: PayloadAction<{ employee: OrganizationEmployee; effectiveDate: string }>,
    ) {
      const index = state.employees.findIndex((item) => item.id === action.payload.employee.id);
      if (index < 0) return;

      const previous = state.employees[index];
      state.employees[index] = action.payload.employee;
      addOrganizationHistory(
        state,
        buildEmployeeUpdatedHistory(
          state.teams,
          previous,
          action.payload.employee,
          action.payload.effectiveDate,
        ),
      );
    },
    deleteEmployee(
      state,
      action: PayloadAction<{ id: number; effectiveDate: string }>,
    ) {
      const employee = state.employees.find((item) => item.id === action.payload.id);
      if (!employee) return;

      employee.endDate = action.payload.effectiveDate;
      addOrganizationHistory(
        state,
        buildEmployeeLeftHistory(employee, action.payload.effectiveDate),
      );
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
