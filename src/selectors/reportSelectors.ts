import { createSelector } from '@reduxjs/toolkit';
import { getAttendanceCodesAtDate } from '@/store/slices/attendanceCodeSlice';
import { filterItemsByPeriod } from '@/lib/management/operationWeek';
import {
  getOrganizationSnapshot,
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
} from '@/store/slices/organizationSlice';
import type { RootState } from '@/store/store';
import type { AttendanceRecord, ReportEmployee } from '@/types/domain';

export const selectReportPeriod = (state: RootState) => state.reportPeriod;

const selectReportStartDate = (state: RootState) => state.reportPeriod.startDate;
const selectReportEndDate = (state: RootState) => state.reportPeriod.endDate;
const selectAttendanceCodes = (state: RootState) => state.attendanceCode.codes;
const selectAttendanceCodeHistory = (state: RootState) => state.attendanceCode.history;
const selectPublishedRecords = (state: RootState) => state.management.publishedRecords;
const selectOrganizationTeams = (state: RootState) => state.organization.teams;
const selectOrganizationEmployees = (state: RootState) => state.organization.employees;
const selectOrganizationHistory = (state: RootState) => state.organization.history;

export const selectReportAttendanceCodes = createSelector(
  [selectAttendanceCodes, selectAttendanceCodeHistory, selectReportEndDate],
  (codes, history, endDate) => getAttendanceCodesAtDate(codes, history, endDate),
);

export const selectReportRecords = createSelector(
  [selectPublishedRecords, selectReportStartDate, selectReportEndDate],
  (publishedRecords, startDate, endDate): AttendanceRecord[] =>
    filterItemsByPeriod(publishedRecords, { startDate, endDate }),
);

export const selectReportOrganizationSnapshot = createSelector(
  [
    selectOrganizationTeams,
    selectOrganizationEmployees,
    selectOrganizationHistory,
    selectReportEndDate,
  ],
  (teams, employees, history, endDate) =>
    getOrganizationSnapshot(teams, employees, history, endDate),
);

export const selectReportEmployees = createSelector(
  [selectReportOrganizationSnapshot],
  (snapshot): ReportEmployee[] =>
    snapshot.employees.map((employee) => ({
      id: employee.id,
      name: employee.name,
      department: employee.teamId === UNASSIGNED_TEAM_ID
        ? UNASSIGNED_TEAM_NAME
        : snapshot.teams.find((team) => team.id === employee.teamId)?.name ?? '-',
      position: employee.position,
    })),
);

export const selectReportAttendanceEventCounts = createSelector(
  [selectReportRecords],
  (records) =>
    records
      .flatMap((record) => record.events)
      .reduce<Record<string, number>>((result, event) => {
        result[event.codeId] = (result[event.codeId] ?? 0) + 1;
        return result;
      }, {}),
);
