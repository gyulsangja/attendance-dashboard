import { getWeeksInMonth } from '@/lib/date';
import {
  buildOperationWeekKey,
  filterItemsByPeriod,
  getOperationWeekPeriod,
} from '@/lib/management/operationWeek';
import { SHIFT_STATUS } from '@/lib/management/shiftSchedules';
import { getAttendanceCodesAtDate } from '@/store/slices/attendanceCodeSlice';
import { getOrganizationSnapshot } from '@/store/slices/organizationSlice';
import type { RootState } from '@/store/store';

export type DashboardEventWithCode = {
  id: string;
  date: string;
  department: string;
  name: string;
  content: string;
  detail: string;
  codeId: string;
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const getDashboardWeekDays = (startDate: string, endDate: string) => {
  const days: Array<{ date: string; day: number; weekday: string }> = [];
  const end = new Date(`${endDate}T00:00:00`);

  for (
    const current = new Date(`${startDate}T00:00:00`);
    current <= end;
    current.setDate(current.getDate() + 1)
  ) {
    days.push({
      date: [
        current.getFullYear(),
        String(current.getMonth() + 1).padStart(2, '0'),
        String(current.getDate()).padStart(2, '0'),
      ].join('-'),
      day: current.getDate(),
      weekday: WEEKDAYS[current.getDay()],
    });
  }

  return days;
};

export const selectDashboardData = (
  state: RootState,
  year: number,
  month: number,
  weekNumber: number,
) => {
  const weeks = getWeeksInMonth(year, month);
  const period = getOperationWeekPeriod(year, month, weekNumber);
  const selectedWeekNumber = period.weekNumber;
  const { startDate, endDate } = period;
  const weekKey = buildOperationWeekKey(year, month, selectedWeekNumber);
  const confirmed = state.management.confirmedWeekKeys.includes(weekKey);
  const attendanceCodes = getAttendanceCodesAtDate(
    state.attendanceCode.codes,
    state.attendanceCode.history,
    endDate,
  );
  const organizationSnapshot = getOrganizationSnapshot(
    state.organization.teams,
    state.organization.employees,
    state.organization.history,
    endDate,
  );
  const reportRecords = filterItemsByPeriod(state.management.publishedRecords, period);
  const workingRecords = filterItemsByPeriod(state.management.deviceRecords, period);
  const terminalRecords = workingRecords.filter(
    (record) => Boolean(record.checkIn || record.checkOut),
  );
  const weekSchedules = filterItemsByPeriod(state.management.schedules, period);
  const weekShifts = filterItemsByPeriod(state.management.shifts, period);
  const shiftCalendarDays = getDashboardWeekDays(startDate, endDate);
  const pendingShifts = weekShifts.filter(
    (shift) => shift.status === SHIFT_STATUS.PENDING,
  ).length;
  const shiftWeekKey = buildOperationWeekKey(year, month, selectedWeekNumber);
  const shiftConfirmed = (state.management.confirmedShiftWeekKeys ?? []).includes(shiftWeekKey);
  const exceptionalCodeIds = new Set(
    attendanceCodes
      .filter((code) => code.isExceptional)
      .map((code) => code.id),
  );
  const eventRows: DashboardEventWithCode[] = reportRecords.flatMap((record) =>
    record.events.map((event, index) => ({
      id: `${record.id}-${index}`,
      date: record.date.slice(5).replace('-', '/'),
      department: record.department,
      name: record.employeeName,
      content: attendanceCodes.find((code) => code.id === event.codeId)?.label
        ?? event.codeId,
      detail: event.detail,
      codeId: event.codeId,
    })),
  );
  const vacationRows = eventRows.filter((row) => !exceptionalCodeIds.has(row.codeId));
  const exceptionRows = eventRows.filter((row) => exceptionalCodeIds.has(row.codeId));
  const eventCounts = reportRecords
    .flatMap((record) => record.events)
    .reduce<Record<string, number>>((result, event) => {
      result[event.codeId] = (result[event.codeId] ?? 0) + 1;
      return result;
    }, {});
  const checkInCount = reportRecords.filter((record) => record.checkIn).length;
  const summaryCards = [
    { label: '출근 기록', value: checkInCount },
    ...attendanceCodes
      .filter((code) => code.isExceptional)
      .map((code) => ({
        label: code.label,
        value: eventCounts[code.id] ?? 0,
      })),
  ];
  const detailAttendanceCodes = attendanceCodes.filter((code) => !code.isExceptional);
  const shiftWorkerCount = organizationSnapshot.employees.filter(
    (employee) => employee.shiftWorker,
  ).length;
  const operationItems = [
    {
      label: '근태 일정 입력',
      value: `${weekSchedules.length}건 입력`,
      done: weekSchedules.length > 0,
    },
    {
      label: '단말기 CSV 확인',
      value: terminalRecords.length > 0 ? `${terminalRecords.length}건 확인` : '업로드 필요',
      done: terminalRecords.length > 0,
    },
    {
      label: '교대근무 확정',
      value: shiftConfirmed ? '확정 완료' : pendingShifts > 0 ? `${pendingShifts}건 승인 대기` : '확정 전',
      done: shiftConfirmed,
    },
    {
      label: '운영관리 최종 확정',
      value: confirmed ? '확정 완료' : '확정 전',
      done: confirmed,
    },
  ];

  return {
    weeks,
    selectedWeekNumber,
    startDate,
    endDate,
    confirmed,
    attendanceCodes,
    organizationSnapshot,
    weekShifts,
    shiftCalendarDays,
    eventCounts,
    summaryCards,
    detailAttendanceCodes,
    shiftWorkerCount,
    operationItems,
    vacationRows,
    exceptionRows,
  };
};
