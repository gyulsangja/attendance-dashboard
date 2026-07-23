import { getCanonicalAttendanceCode } from '@/lib/attendance/attendanceCodeCanonical';
import { filterItemsByPeriod } from '@/lib/management/operationWeek';
import {
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
} from '@/store/slices/organizationSlice';
import type { RootState } from '@/store/store';
import type { AttendanceCode, AttendanceRecord } from '@/types/domain';
import {
  selectOperationAttendanceCodes,
  selectOperationTemplateSnapshot,
  selectOperationWeekDays,
  selectSelectedOperationWeek,
} from './managementSelectors';

export type OperationWeeklyReportTimeCell = {
  time: string;
  codes: string;
};

export type OperationWeeklyReport = {
  title: string;
  periodLabel: string;
  generatedAt: string;
  codeCounts: Array<{
    codeId: string;
    label: string;
    count: number;
    exceptional: boolean;
  }>;
  timeColumns: Array<{
    date: string;
    label: string;
  }>;
  timeRows: Array<{
    employeeId: number;
    department: string;
    employeeName: string;
    cells: Record<string, OperationWeeklyReportTimeCell>;
  }>;
};

const countEventsByCode = (
  records: AttendanceRecord[],
  attendanceCodes: AttendanceCode[],
) => {
  const counts = records
    .flatMap((record) => record.events)
    .reduce<Record<string, number>>((result, event) => {
      const canonical = getCanonicalAttendanceCode(event.codeId, attendanceCodes, event.detail);
      result[canonical.id] = (result[canonical.id] ?? 0) + 1;
      return result;
    }, {});

  return Object.entries(counts)
    .map(([codeId, count]) => {
      const code = attendanceCodes.find((item) => item.id === codeId);
      const canonical = getCanonicalAttendanceCode(codeId, attendanceCodes, code?.label);
      return {
        codeId: canonical.id,
        label: canonical.label,
        count,
        exceptional: code?.isExceptional ?? ['LATE', 'EARLY_LEAVE', 'ABSENT'].includes(canonical.id),
      };
    })
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
};

const getDepartmentName = (
  employee: { teamId: string },
  teams: ReturnType<typeof selectOperationTemplateSnapshot>['teams'],
) => employee.teamId === UNASSIGNED_TEAM_ID
  ? UNASSIGNED_TEAM_NAME
  : teams.find((team) => team.id === employee.teamId)?.name ?? '-';

const getEventCodeLabels = (
  record: AttendanceRecord | undefined,
  attendanceCodes: AttendanceCode[],
) => {
  if (!record || record.events.length === 0) return '';

  return [...new Map(record.events.map((event) => {
    const canonical = getCanonicalAttendanceCode(event.codeId, attendanceCodes, event.detail);
    return [canonical.id, canonical.label] as const;
  })).values()].join(', ');
};

const getTimeCell = (
  record: AttendanceRecord | undefined,
  attendanceCodes: AttendanceCode[],
): OperationWeeklyReportTimeCell => ({
  time: record && (record.checkIn || record.checkOut)
    ? `${record.checkIn ?? '-'} / ${record.checkOut ?? '-'}`
    : '-',
  codes: getEventCodeLabels(record, attendanceCodes),
});

export const selectOperationWeeklyReport = (state: RootState): OperationWeeklyReport => {
  const week = selectSelectedOperationWeek(state);
  const weekDays = selectOperationWeekDays(state);
  const attendanceCodes = selectOperationAttendanceCodes(state);
  const snapshot = selectOperationTemplateSnapshot(state);
  const records = filterItemsByPeriod(state.management.publishedRecords, week);
  const codeCounts = countEventsByCode(records, attendanceCodes);

  return {
    title: `${week.label} 주간 근태 보고`,
    periodLabel: `${week.startDate} ~ ${week.endDate}`,
    generatedAt: new Intl.DateTimeFormat('ko-KR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date()),
    codeCounts,
    timeColumns: weekDays.map((day) => ({
      date: day.date,
      label: day.label,
    })),
    timeRows: snapshot.employees.map((employee) => {
      const department = getDepartmentName(employee, snapshot.teams);
      const cells = weekDays.reduce<Record<string, OperationWeeklyReportTimeCell>>((result, day) => {
        const record = records.find(
          (item) => item.employeeId === employee.id && item.date === day.date,
        );
        result[day.date] = getTimeCell(record, attendanceCodes);
        return result;
      }, {});

      return {
        employeeId: employee.id,
        department,
        employeeName: employee.name,
        cells,
      };
    }),
  };
};
