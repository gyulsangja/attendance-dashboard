import type { AttendanceCsvResult } from '@/lib/csv/parseAttendanceCsv';
import {
  getOrganizationSnapshot,
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
} from '@/store/slices/organizationSlice';
import type {
  AttendanceRecord,
  DeviceUploadSummary,
  OperationSchedule,
  OrganizationEmployee,
  OrganizationHistory,
  OrganizationTeam,
  ShiftSchedule,
  WorkTimePolicy,
} from '@/types/domain';
import { getAttendanceRules } from './attendanceRules';
import { evaluateAttendance } from './evaluateAttendance';

type WeekDay = { date: string; label: string };
type Period = { startDate: string; endDate: string };
type OrganizationSource = {
  teams: OrganizationTeam[];
  employees: OrganizationEmployee[];
  history: OrganizationHistory[];
};

export type BuildDeviceUploadRecordsInput = {
  parsed: AttendanceCsvResult;
  fileName: string;
  period: Period;
  weekDays: WeekDay[];
  existingRecords: AttendanceRecord[];
  schedules: OperationSchedule[];
  shifts: ShiftSchedule[];
  organization: OrganizationSource;
  policy: WorkTimePolicy;
};

export type BuildDeviceUploadRecordsResult = {
  records: AttendanceRecord[];
  summary: DeviceUploadSummary;
};

const normalizeIdentity = (value: string) => value
  .normalize('NFKC')
  .replace(/\s+/g, '')
  .toLowerCase();

const departmentAliases = new Map([
  [normalizeIdentity('개발부서'), normalizeIdentity('개발팀')],
  [normalizeIdentity('경영관리'), normalizeIdentity('경영관리팀')],
  [normalizeIdentity('기술부서'), normalizeIdentity('기술팀')],
  [normalizeIdentity('영업부서'), normalizeIdentity('전략영업부')],
]);

const normalizeDepartmentIdentity = (value: string) => {
  const normalized = normalizeIdentity(value);
  return departmentAliases.get(normalized) ?? normalized;
};

const getDepartmentName = (
  employee: OrganizationEmployee,
  teams: OrganizationTeam[],
) => employee.teamId === UNASSIGNED_TEAM_ID
  ? UNASSIGNED_TEAM_NAME
  : teams.find((team) => team.id === employee.teamId)?.name ?? '-';

const findEmployeeForCsvRow = ({
  organization,
  date,
  employeeName,
  department,
}: {
  organization: OrganizationSource;
  date: string;
  employeeName: string;
  department: string;
}) => {
  const snapshot = getOrganizationSnapshot(
    organization.teams,
    organization.employees,
    organization.history,
    date,
  );
  const sameNameEmployees = snapshot.employees.filter(
    (item) => normalizeIdentity(item.name) === normalizeIdentity(employeeName),
  );
  const sameDepartmentEmployees = sameNameEmployees.filter((item) => (
    normalizeDepartmentIdentity(getDepartmentName(item, snapshot.teams)) === normalizeDepartmentIdentity(department)
  ));

  return {
    snapshot,
    employees: sameDepartmentEmployees.length > 0
      ? sameDepartmentEmployees
      : sameNameEmployees,
  };
};

export const buildDeviceUploadRecords = ({
  parsed,
  fileName,
  period,
  weekDays,
  existingRecords,
  schedules,
  shifts,
  organization,
  policy,
}: BuildDeviceUploadRecordsInput): BuildDeviceUploadRecordsResult => {
  const errors = parsed.errors.map(
    (error) => `${error.row}행: ${error.message}`,
  );
  const records: AttendanceRecord[] = [];
  const importedKeys = new Set<string>();
  let nextId = Math.max(0, ...existingRecords.map((record) => record.id)) + 1;

  parsed.rows.forEach((row) => {
    if (row.date < period.startDate || row.date > period.endDate) {
      errors.push(`${row.row}행: 선택한 주차(${period.startDate} ~ ${period.endDate})의 일자가 아닙니다.`);
      return;
    }

    const { snapshot, employees } = findEmployeeForCsvRow({
      organization,
      date: row.date,
      employeeName: row.employeeName,
      department: row.department,
    });
    if (employees.length === 0) {
      errors.push(`${row.row}행: ${row.department}의 ${row.employeeName} 구성원을 찾을 수 없습니다.`);
      return;
    }
    if (employees.length > 1) {
      errors.push(`${row.row}행: ${row.department}에 동명이인이 있어 구성원을 구분할 수 없습니다.`);
      return;
    }

    const employee = employees[0];
    const plannedSchedule = schedules.find(
      (item) => item.employeeId === employee.id && item.date === row.date,
    );
    const shiftSchedule = shifts.find(
      (item) => item.employeeId === employee.id && item.date === row.date,
    );
    const {
      attendanceExempt,
      attendanceRequired,
      publicHoliday,
      standard,
    } = getAttendanceRules({
      employee,
      date: row.date,
      plannedSchedule,
      shiftSchedule,
      policy,
    });

    records.push({
      id: nextId,
      employeeId: employee.id,
      employeeName: employee.name,
      department: getDepartmentName(employee, snapshot.teams),
      position: employee.position,
      date: row.date,
      checkIn: row.checkIn || undefined,
      checkOut: row.checkOut || undefined,
      events: attendanceExempt || publicHoliday
        ? []
        : attendanceRequired && !row.checkIn
          ? [{ codeId: 'ABSENT', detail: '출근시간 미등록' }]
          : evaluateAttendance(
            { checkIn: row.checkIn, checkOut: row.checkOut },
            standard,
          ),
    });
    importedKeys.add(`${employee.id}-${row.date}`);
    nextId += 1;
  });

  const terminalValidRows = records.length;
  weekDays.forEach((day) => {
    const snapshot = getOrganizationSnapshot(
      organization.teams,
      organization.employees,
      organization.history,
      day.date,
    );

    snapshot.employees.forEach((employee) => {
      if (importedKeys.has(`${employee.id}-${day.date}`)) return;

      const plannedSchedule = schedules.find(
        (item) => item.employeeId === employee.id && item.date === day.date,
      );
      const shiftSchedule = shifts.find(
        (item) => item.employeeId === employee.id && item.date === day.date,
      );
      const { attendanceExempt, attendanceRequired } = getAttendanceRules({
        employee,
        date: day.date,
        plannedSchedule,
        shiftSchedule,
        policy,
      });
      if (attendanceExempt || !attendanceRequired) return;

      records.push({
        id: nextId,
        employeeId: employee.id,
        employeeName: employee.name,
        department: getDepartmentName(employee, snapshot.teams),
        position: employee.position,
        date: day.date,
        events: [{ codeId: 'ABSENT', detail: '단말기 출퇴근 기록 없음' }],
      });
      nextId += 1;
    });
  });

  return {
    records,
    summary: {
      fileName,
      uploadedAt: new Intl.DateTimeFormat('ko-KR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date()),
      startDate: period.startDate,
      endDate: period.endDate,
      totalRows: parsed.totalRows,
      validRows: terminalValidRows,
      errorRows: errors.length,
      absenceRows: records.length - terminalValidRows,
      errors,
    },
  };
};
