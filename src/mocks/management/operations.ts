import type { OperationSchedule, ShiftSchedule } from '@/types/domain';
import { SHIFT_STATUS } from '@/lib/management/shiftSchedules';
import { attendanceCodes } from '../attendanceCodes';
import { attendanceRecords, getReportEmployee } from '../reports/reportData';

export const confirmedOperationWeeks = [
  {
    key: '2026-6-2',
    startDate: '2026-06-07',
    endDate: '2026-06-13',
  },
];

export type { OperationSchedule, ShiftSchedule } from '@/types/domain';

export const shiftWorkers = [
  { employeeId: 9, name: '박서연' },
  { employeeId: 10, name: '오하늘' },
  { employeeId: 13, name: '김태윤' },
];

const plannedCodeIds = new Set(
  attendanceCodes
    .filter((code) => code.isSchedulable)
    .map((code) => code.id),
);

// 현황통계와 동일한 출퇴근 기록에서 계획성 근태만 운영관리 일정으로 변환합니다.
export const operationSchedules: OperationSchedule[] = attendanceRecords.flatMap(
  (record) => {
    const employee = getReportEmployee(record.employeeId);
    return record.events
      .filter((event) => plannedCodeIds.has(event.codeId))
      .map((event, index) => ({
        id: record.id * 100 + index,
        date: record.date,
        department: employee?.department ?? '-',
        employeeId: record.employeeId,
        name: employee?.name ?? '-',
        codeId: event.codeId,
        type: attendanceCodes.find((code) => code.id === event.codeId)?.label
          ?? event.codeId,
        detail: event.detail,
      }));
  },
);

export const shiftSchedules: ShiftSchedule[] = [
  {
    id: 1,
    date: '2026-06-08',
    employeeId: 9,
    name: '박서연',
    shift: '주간',
    time: '09:00 ~ 18:00',
    checkIn: '09:00',
    checkOut: '18:00',
    status: SHIFT_STATUS.CONFIRMED,
  },
  {
    id: 2,
    date: '2026-06-08',
    employeeId: 10,
    name: '오하늘',
    shift: '야간',
    time: '21:00 ~ 익일 09:00',
    checkIn: '21:00',
    checkOut: '09:00',
    status: SHIFT_STATUS.CONFIRMED,
  },
  {
    id: 4,
    date: '2026-06-09',
    employeeId: 9,
    name: '박서연',
    shift: '오후',
    time: '12:00 ~ 21:00',
    checkIn: '12:00',
    checkOut: '21:00',
    status: SHIFT_STATUS.CONFIRMED,
  },
  {
    id: 5,
    date: '2026-06-09',
    employeeId: 10,
    name: '오하늘',
    shift: '야간',
    time: '21:00 ~ 익일 09:00',
    checkIn: '21:00',
    checkOut: '09:00',
    status: SHIFT_STATUS.CONFIRMED,
  },
  {
    id: 7,
    date: '2026-06-15',
    employeeId: 9,
    name: '박서연',
    shift: '야간',
    time: '21:00 ~ 익일 09:00',
    checkIn: '21:00',
    checkOut: '09:00',
    status: SHIFT_STATUS.PENDING,
  },
  {
    id: 8,
    date: '2026-06-15',
    employeeId: 10,
    name: '오하늘',
    shift: '주간',
    time: '09:00 ~ 18:00',
    checkIn: '09:00',
    checkOut: '18:00',
    status: SHIFT_STATUS.PENDING,
  },
];
