import type {
  OperationSchedule,
  OrganizationEmployee,
  ShiftSchedule,
  WorkTimePolicy,
} from '@/types/domain';
import { isKoreanPublicHoliday } from '@/lib/date';

export type AttendanceStandard = {
  checkIn: string;
  checkOut: string;
};

export type AttendanceRuleResult = {
  attendanceExempt: boolean;
  attendanceRequired: boolean;
  standard: AttendanceStandard | null;
  publicHoliday: boolean;
};

export const defaultWorkTimePolicy: WorkTimePolicy = {
  regularStart: '09:00',
  regularEnd: '18:00',
  halfAmStart: '14:00',
  halfAmEnd: '18:00',
  halfPmStart: '09:00',
  halfPmEnd: '13:00',
  lateGraceMinutes: 0,
  earlyLeaveGraceMinutes: 0,
};

export const getAttendanceRules = ({
  employee,
  date,
  plannedSchedule,
  shiftSchedule,
  policy = defaultWorkTimePolicy,
}: {
  employee: Pick<OrganizationEmployee, 'shiftWorker'>;
  date: string;
  plannedSchedule?: OperationSchedule;
  shiftSchedule?: ShiftSchedule;
  policy?: WorkTimePolicy;
}): AttendanceRuleResult => {
  const attendanceExempt = Boolean(
    plannedSchedule
    && !['HALF_AM', 'HALF_PM'].includes(plannedSchedule.codeId),
  );
  const dayOfWeek = new Date(`${date}T00:00:00`).getDay();
  const weekday = dayOfWeek !== 0 && dayOfWeek !== 6;
  const publicHoliday = !employee.shiftWorker && isKoreanPublicHoliday(date);
  const attendanceRequired = employee.shiftWorker
    ? Boolean(shiftSchedule)
    : weekday && !publicHoliday;
  const standard = employee.shiftWorker
    ? shiftSchedule?.checkIn && shiftSchedule.checkOut
      ? { checkIn: shiftSchedule.checkIn, checkOut: shiftSchedule.checkOut }
      : null
    : plannedSchedule?.codeId === 'HALF_AM'
      ? { checkIn: policy.halfAmStart, checkOut: policy.halfAmEnd }
      : plannedSchedule?.codeId === 'HALF_PM'
        ? { checkIn: policy.halfPmStart, checkOut: policy.halfPmEnd }
        : { checkIn: policy.regularStart, checkOut: policy.regularEnd };

  return {
    attendanceExempt,
    attendanceRequired,
    standard,
    publicHoliday,
  };
};
