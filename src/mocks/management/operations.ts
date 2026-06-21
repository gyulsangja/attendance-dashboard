export const operationWeeks = [
  { id: '2026-06-2', label: '2026년 6월 2주차', startDate: '2026-06-07', endDate: '2026-06-13' },
  { id: '2026-06-1', label: '2026년 6월 1주차', startDate: '2026-05-31', endDate: '2026-06-06' },
  { id: '2026-05-5', label: '2026년 5월 5주차', startDate: '2026-05-24', endDate: '2026-05-30' },
];

export const confirmedOperationWeeks = [
  {
    key: '2026-6-2',
    startDate: '2026-06-07',
    endDate: '2026-06-13',
  },
];

export type OperationSchedule = {
  id: number; date: string; department: string; employeeId: number; name: string;
  codeId: string; type: string; detail: string;
};

export type ShiftSchedule = {
  id: number; date: string; employeeId: number; name: string;
  shift: string; time: string; status: string;
};

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

export const deviceUploadMock = {
  fileName: 'attendance_20260607_20260613.csv',
  uploadedAt: '2026-06-14 09:12',
  totalRows: 48,
  validRows: 46,
  errorRows: 2,
};

export const shiftSchedules: ShiftSchedule[] = [
  { id: 1, date: '2026-06-08', employeeId: 9, name: '박서연', shift: '주간', time: '08:00 ~ 20:00', status: '확정' },
  { id: 2, date: '2026-06-08', employeeId: 10, name: '오하늘', shift: '야간', time: '20:00 ~ 익일 08:00', status: '확정' },
  { id: 3, date: '2026-06-08', employeeId: 13, name: '김태윤', shift: '휴무', time: '-', status: '확정' },
  { id: 4, date: '2026-06-09', employeeId: 9, name: '박서연', shift: '주간', time: '08:00 ~ 20:00', status: '확정' },
  { id: 5, date: '2026-06-09', employeeId: 10, name: '오하늘', shift: '야간', time: '20:00 ~ 익일 08:00', status: '확정' },
  { id: 6, date: '2026-06-09', employeeId: 13, name: '김태윤', shift: '휴무', time: '-', status: '확정' },
  { id: 7, date: '2026-06-15', employeeId: 9, name: '박서연', shift: '야간', time: '20:00 ~ 익일 08:00', status: '승인대기' },
  { id: 8, date: '2026-06-15', employeeId: 10, name: '오하늘', shift: '주간', time: '08:00 ~ 20:00', status: '승인대기' },
  { id: 9, date: '2026-06-15', employeeId: 13, name: '김태윤', shift: '휴무', time: '-', status: '승인대기' },
];
import { attendanceCodes } from '../attendanceCodes';
import { attendanceRecords, getReportEmployee } from '../reports/reportData';
