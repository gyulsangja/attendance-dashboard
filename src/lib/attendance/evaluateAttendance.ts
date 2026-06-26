import type { AttendanceEvent } from '@/types/domain';
import type { AttendanceStandard } from './attendanceRules';

const toMinutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};

export const evaluateAttendance = (
  actual: AttendanceStandard,
  standard: AttendanceStandard | null,
): AttendanceEvent[] => {
  if (!standard) return [];

  const events: AttendanceEvent[] = [];
  const expectedIn = toMinutes(standard.checkIn);
  let expectedOut = toMinutes(standard.checkOut);
  const actualIn = actual.checkIn ? toMinutes(actual.checkIn) : null;
  let actualOut = actual.checkOut ? toMinutes(actual.checkOut) : null;

  if (expectedOut <= expectedIn) {
    expectedOut += 24 * 60;
    if (actualOut !== null && actualOut < expectedIn) actualOut += 24 * 60;
  }

  if (actualIn !== null && actualIn > expectedIn) {
    events.push({
      codeId: 'LATE',
      detail: `${actual.checkIn} 출근 (기준 ${standard.checkIn})`,
    });
  }
  if (actualOut !== null && actualOut < expectedOut) {
    events.push({
      codeId: 'EARLY_LEAVE',
      detail: `${actual.checkOut} 퇴근 (기준 ${standard.checkOut})`,
    });
  }

  return events;
};
