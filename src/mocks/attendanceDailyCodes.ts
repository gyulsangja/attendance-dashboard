import { attendanceRecords } from './reports/reportData';

export type AttendanceDailyCode = {
  id: number;
  attendanceDailyId: number;
  codeId: string;
  detail?: string;
};

// 근태 이벤트 원본에서 이전 형식으로 변환한 호환 데이터입니다.
export const attendanceDailyCodes: AttendanceDailyCode[] = attendanceRecords.flatMap(
  (record) => record.events.map((event, index) => ({
    id: record.id * 100 + index,
    attendanceDailyId: record.id,
    codeId: event.codeId,
    detail: event.detail,
  })),
);
