import type {
  AttendanceRecord,
  OperationSchedule,
  ReportEmployee,
  ShiftSchedule,
} from '@/types/domain';
import {
  defaultWorkTimePolicy,
  getAttendanceRules,
} from '@/lib/attendance/attendanceRules';
import { evaluateAttendance } from '@/lib/attendance/evaluateAttendance';
import {
  AUTOMATIC_ATTENDANCE_CODE_IDS,
} from '@/lib/management/attendanceRecords';
import {
  cloneAttendanceRecords,
  isDateInPeriod,
} from '@/lib/management/operationWeek';

type ConfirmedOperationPeriod = {
  startDate: string;
  endDate: string;
};

type BuildInitialDeviceRecordsParams = {
  attendanceRecords: AttendanceRecord[];
  confirmedOperationWeeks: ConfirmedOperationPeriod[];
  operationSchedules: OperationSchedule[];
  shiftSchedules: ShiftSchedule[];
  shiftWorkerIds: Set<number>;
  getEmployeesForDate: (date: string) => ReportEmployee[];
};

const formatDate = (date: Date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

export const buildInitialDeviceRecords = ({
  attendanceRecords,
  confirmedOperationWeeks,
  operationSchedules,
  shiftSchedules,
  shiftWorkerIds,
  getEmployeesForDate,
}: BuildInitialDeviceRecordsParams) => {
  const records = cloneAttendanceRecords(attendanceRecords);
  let nextId = Math.max(0, ...records.map((record) => record.id)) + 1;

  confirmedOperationWeeks.forEach((period) => {
    for (
      let current = new Date(`${period.startDate}T00:00:00`);
      current <= new Date(`${period.endDate}T00:00:00`);
      current.setDate(current.getDate() + 1)
    ) {
      const date = formatDate(current);
      getEmployeesForDate(date).forEach((employee) => {
        const plannedSchedule = operationSchedules.find(
          (schedule) => schedule.employeeId === employee.id && schedule.date === date,
        );
        const shiftSchedule = shiftSchedules.find(
          (schedule) => schedule.employeeId === employee.id && schedule.date === date,
        );
        const { attendanceExempt, attendanceRequired, standard } = getAttendanceRules({
          employee: { shiftWorker: shiftWorkerIds.has(employee.id) },
          date,
          plannedSchedule,
          shiftSchedule,
          policy: defaultWorkTimePolicy,
        });

        if (!attendanceRequired || attendanceExempt) return;

        const existing = records.find(
          (record) => record.employeeId === employee.id && record.date === date,
        );
        const automaticEvents = existing?.checkIn
          ? evaluateAttendance(
            { checkIn: existing.checkIn, checkOut: existing.checkOut ?? '' },
            standard,
          )
          : [{ codeId: 'ABSENT', detail: '단말기 출근 기록 없음' }];

        if (existing) {
          existing.events = [
            ...existing.events.filter(
              (event) => !AUTOMATIC_ATTENDANCE_CODE_IDS.has(event.codeId),
            ),
            ...automaticEvents,
          ];
          return;
        }

        records.push({
          id: nextId,
          employeeId: employee.id,
          employeeName: employee.name,
          department: employee.department,
          position: employee.position,
          date,
          events: automaticEvents,
        });
        nextId += 1;
      });
    }
  });

  return records;
};

export const filterRecordsByConfirmedOperationWeeks = (
  records: AttendanceRecord[],
  confirmedOperationWeeks: ConfirmedOperationPeriod[],
) => records.filter((record) =>
  confirmedOperationWeeks.some((period) => isDateInPeriod(record.date, period)),
);
