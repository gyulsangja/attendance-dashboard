import {
  formatDateKey,
  getWeeksInMonth,
} from '@/lib/date';
import {
  filterItemsByPeriod,
  getOperationWeekPeriod,
} from '@/lib/management/operationWeek';
import { getAttendanceCodesAtDate } from '@/store/slices/attendanceCodeSlice';
import {
  getOrganizationSnapshot,
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
} from '@/store/slices/organizationSlice';
import type { RootState } from '@/store/store';

export type OperationStepSummary = {
  label: string;
  value: string;
  done: boolean;
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export const selectManagementState = (state: RootState) => state.management;

export const selectOperationWeekOptions = (state: RootState) => {
  const { year, month } = selectManagementState(state);
  return getWeeksInMonth(year, month);
};

export const selectSelectedOperationWeek = (state: RootState) => {
  const { year, month, weekNumber } = selectManagementState(state);
  const period = getOperationWeekPeriod(year, month, weekNumber);

  return {
    label: `${period.year}년 ${period.month}월 ${period.weekNumber}주차`,
    startDate: period.startDate,
    endDate: period.endDate,
  };
};

export const selectOperationAttendanceCodes = (state: RootState) => {
  const week = selectSelectedOperationWeek(state);
  const { codes, history } = state.attendanceCode;

  return getAttendanceCodesAtDate(codes, history, week.endDate);
};

export const selectOperationWeekDays = (state: RootState) => {
  const week = selectSelectedOperationWeek(state);
  const days: { date: string; label: string }[] = [];
  const end = new Date(`${week.endDate}T00:00:00`);

  for (
    const current = new Date(`${week.startDate}T00:00:00`);
    current <= end;
    current.setDate(current.getDate() + 1)
  ) {
    days.push({
      date: formatDateKey(current),
      label: `${current.getMonth() + 1}/${current.getDate()} (${WEEKDAYS[current.getDay()]})`,
    });
  }

  return days;
};

export const selectOperationTemplateSnapshot = (state: RootState) => {
  const week = selectSelectedOperationWeek(state);
  const { teams, employees, history } = state.organization;

  return getOrganizationSnapshot(teams, employees, history, week.startDate);
};

export const selectOperationTemplateEmployees = (state: RootState) => {
  const snapshot = selectOperationTemplateSnapshot(state);

  return snapshot.employees.map((employee) => ({
    employeeId: employee.id,
    employeeNo: employee.employeeNo,
    employeeName: employee.name,
    department: employee.teamId === UNASSIGNED_TEAM_ID
      ? UNASSIGNED_TEAM_NAME
      : snapshot.teams.find((team) => team.id === employee.teamId)?.name ?? '-',
    position: employee.position,
    shiftWorker: employee.shiftWorker,
    email: employee.email,
  }));
};

export const selectOperationWeekShiftWorkers = (state: RootState) =>
  selectOperationTemplateSnapshot(state).employees
    .filter((employee) => employee.shiftWorker)
    .map((employee) => ({ employeeId: employee.id, name: employee.name }));

export const selectOperationWeekSchedules = (state: RootState) => {
  const week = selectSelectedOperationWeek(state);
  return filterItemsByPeriod(state.management.schedules, week);
};

export const selectDisplayedOperationWeekSchedules = (state: RootState) =>
  selectOperationWeekSchedules(state).map((schedule) => ({
    ...schedule,
    type: getAttendanceCodesAtDate(
      state.attendanceCode.codes,
      state.attendanceCode.history,
      schedule.date,
    ).find((code) => code.id === schedule.codeId)?.label ?? schedule.type,
  }));

export const selectOperationWeekShifts = (state: RootState) => {
  const week = selectSelectedOperationWeek(state);
  return filterItemsByPeriod(state.management.shifts, week);
};

export const selectOperationWeekDeviceRecords = (state: RootState) => {
  const week = selectSelectedOperationWeek(state);
  return filterItemsByPeriod(state.management.deviceRecords, week);
};

export const selectOperationWeekTerminalRecords = (state: RootState) =>
  selectOperationWeekDeviceRecords(state).filter((item) => Boolean(item.checkIn || item.checkOut));

export const selectOperationWeekCsvUploaded = (state: RootState) =>
  selectOperationWeekTerminalRecords(state).length > 0;

export const selectOperationSteps = (state: RootState): OperationStepSummary[] => {
  const weekSchedules = selectOperationWeekSchedules(state);
  const weekShifts = selectOperationWeekShifts(state);
  const weekTerminalRecords = selectOperationWeekTerminalRecords(state);
  const weekCsvUploaded = weekTerminalRecords.length > 0;
  const { confirmed } = state.management;

  return [
    {
      label: '근태 일정',
      value: `${weekSchedules.length}건 입력`,
      done: weekSchedules.length > 0,
    },
    {
      label: '출입통제데이터',
      value: weekCsvUploaded ? '업로드 완료' : '업로드 필요',
      done: weekCsvUploaded,
    },
    {
      label: '교대 근무',
      value: weekShifts.length === 0
        ? '일정 없음'
        : `${weekShifts.length}건 등록`,
      done: true,
    },
    {
      label: '운영관리',
      value: confirmed ? '검토완료' : '검토중',
      done: confirmed,
    },
  ];
};

